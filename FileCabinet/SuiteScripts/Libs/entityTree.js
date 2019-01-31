define(['N/search'],
    function (search) {
        //-------------------------------------------
        //Entity Tree Support
        function getEntityList() {
            var srch = search.create({
                type: "account",
                filters:
                    [
                        ["type", "anyof", "Bank"]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "name",
                            sort: search.Sort.ASC,
                            label: "Name"
                        }),
                        search.createColumn({name: "legalname", label: "Legal Name"}),
                        search.createColumn({name: "type", label: "Account Type"}),
                        search.createColumn({name: "description", label: "Description"}),
                        search.createColumn({name: "subsidiarynohierarchy", label: "Entity (no hierarchy)"})
                    ]
            });
            var od, d1, banks;
            var plh;
            od = runSavedSearch(srch);
            d1 = searchResultsToArray(od, plh, plh, true);
            banks = d1.map(function (e) {
                var r = {};
                r.accountId = e.internalid;
                r.accountName = e.name;
                r.accountType = e.type.value;
                r.entityName = e.subsidiarynohierarchy.text;
                r.entityId = e.subsidiarynohierarchy.value;

                return r;
            });
            var subSrch = search.create({
                type: "subsidiary",
                filters:
                    [],
                columns:
                    [
                        search.createColumn({name: "internalid", label: "Internal ID"}),
                        search.createColumn({name: "custrecord_ccc_entity_code", label: "Entity Code"}),
                        search.createColumn({name: "namenohierarchy", label: "Name (no hierarchy)"}),
                        search.createColumn({name: "parent", label: "Parent Entity"}),
                        search.createColumn({name: "country", label: "Country"}),
                        search.createColumn({name: "currency", label: "Currency"}),
                        search.createColumn({name: "language", label: "Language"}),
                        search.createColumn({
                            name: "custrecord_ccc_is_consolidation_sub",
                            label: "Is Consolidation Subsidiary"
                        }),
                        search.createColumn({name: "iselimination", label: "Elimination"})
                    ]
            });
            var oSr = runSavedSearch(subSrch);
            oSr = searchResultsToArray(oSr);

            var mapper = function (e) {

                var r = {};
                r.id = e.internalid;
                r.code = e.custrecord_ccc_entity_code;
                r.name = e.namenohierarchy;
                r.parentId = e.parent;
                r.country = e.country;
                r.currency = e.currency;

                r.precision = currencyPrecision(e.currency);
                r.language = e.language;
                r.isConsolidation = e.custrecord_ccc_is_consolidation_sub;
                r.isElimination = e.iselimination;

                r.countryCode = '??';
                var ccIdx = COUNTRY_NAMES.indexOf(e.country);
                if (ccIdx > -1) {
                    r.countryCode = COUNTRY_IDS[ccIdx];
                }
                //Bank Accounts!
                r.bankAccount = "";
                var ba = banks.filter(function (e) {
                    return e.entityId == r.id
                });

                r.bankAccount = ba;

                return r;
            }
            oSr = oSr.map(mapper);
            return oSr;
        }

        function getEntityTree() {
            var theTree = {};
            theTree.areaMap = [];
            theTree.Entities = getsublist();
            theTree.firstInCountryCode = function (c) {

            }
            theTree.isInCountryCode = function (o, cc) {
                return o.countryCode == cc;
            };
            theTree.getChildrenInCountryCode = function (p, cc) {
                var fn = function (e) {
                    return e.countryCode == cc;
                };
                return this.getChildren(p, fn);
            }
            theTree.getChildren = function (p, fn) {
                var cl = [];
                cl = p.children.filter(fn);
                return cl;
            }
            theTree.getAreaOffice = function (ent) {
                if (!ent) {
                    return null
                }
                ;
                if (!ent.parent) {
                    return ent;
                }
                if (ent.parent.code == "WHQ") {
                    return ent;
                }
                var areaEnt = null;
                var currEnt = ent;
                while (!areaEnt) {
                    if (currEnt.parent.code == "WHQ") {
                        areaEnt = currEnt;
                    } else {
                        try {
                            currEnt = currEnt.parent;
                        } catch (e) {
                            //Parent Expected...
                            return null;
                        }
                    }
                }
                return areaEnt;
            }
            theTree.nodeFound = null;
            theTree.searchBranchFn = function (v, fn, node) {
                if (this.nodeFound != null) {
                    return this.nodeFound
                }
                ;
                if (!node) {
                    return null
                }
                ;

                if (fn(v, node)) {
                    this.nodeFound = node;
                    log.debug("Node Found!");
                    return node;
                }
                if (node.children.length > 0) {
                    for (var i = 0; i < node.children.length; i++) {
                        if (this.nodeFound == null) {
                            //oNode = this.searchBranchFn(this.searchBranchFn(v,fn,node.children[i]));
                            oNode = this.searchBranchFn(v, fn, node.children[i]);
                            if (oNode) {
                                this.nodeFound = oNode;
                                return oNode;
                            }
                        } else {
                            return this.nodeFound;
                        }
                    }
                }
                //log.debug("Node not found in branch: "+node.getCodePath());
                return null;

            }
            theTree.searchBranchCountryCode = function (cc, node) {
                if (this.nodeFound != null) {
                    return this.nodeFound
                }
                ;
                if (!node) {
                    return null
                }
                ;

                if (node.country == cc) {
                    this.nodeFound = node;
                    log.debug("Node Found!");
                    return node;
                }
                if (node.children.length > 0) {
                    for (var i = 0; i < node.children.length; i++) {
                        if (this.nodeFound == null) {
                            //oNode = this.searchBranchCountryCode(this.searchBranchCountryCode(cc,node.children[i]));
                            oNode = this.searchBranchCountryCode(cc, node.children[i]);
                            if (oNode) {
                                this.nodeFound = oNode;
                                return oNode;
                            }
                        } else {
                            return this.nodeFound;
                        }
                    }
                }
                //log.debug("Node not found in branch: "+node.getCodePath());
                return null;


            }
            theTree.searchBranchId = function (id, node) {
                if (this.nodeFound != null) {
                    return this.nodeFound
                }
                ;
                if (!node) {
                    return null
                }
                ;
                //log.debug(code + " => "+node.getCodePath());
                if (node.id == id) {
                    this.nodeFound = node;
                    log.debug("Node Found!");
                    return node;
                }
                if (node.children.length > 0) {
                    for (var i = 0; i < node.children.length; i++) {
                        if (this.nodeFound == null) {
                            //oNode = this.searchBranchId(this.searchBranchId(id,node.children[i]));
                            oNode = this.searchBranchId(id, node.children[i]);
                            if (oNode) {
                                this.nodeFound = oNode;
                                return oNode;
                            }
                        } else {
                            return this.nodeFound;
                        }
                    }
                }
                //log.debug("Node not found in branch: "+node.getCodePath());
                return null;

            }
            theTree.searchBranch = function (code, node) {
                if (this.nodeFound != null) {
                    return this.nodeFound
                }
                ;
                if (!node) {
                    return null
                }
                ;
                log.debug(code + " => " + node.getCodePath());
                if (node.code == code) {
                    this.nodeFound = node;
                    log.debug("Node Found!");
                    return node;
                }
                if (node.children.length > 0) {
                    for (var i = 0; i < node.children.length; i++) {
                        if (this.nodeFound == null) {
                            //oNode = this.searchBranch(this.searchBranch(code,node.children[i]));
                            oNode = this.searchBranch(code, node.children[i]);
                            if (oNode) {
                                this.nodeFound = oNode;
                                return oNode;
                            }
                        } else {
                            return this.nodeFound;
                        }
                    }
                }
                //log.debug("Node not found in branch: "+node.getCodePath());
                return null;

            };
            theTree.getEntity = function (code) {
                if (this.Entities.code == code) {
                    return this.Entities
                }
                var theEntity = null;
                var more = true;
                var currentEntity, currentChild
                currentEntity = this.Entities.children[0];
                var GNum, SNum,
                    GNum = 0;
                SNum = 0;
                this.nodeFound = null;
                theEntity = this.searchBranch(code, this.Entities);
                return theEntity;
            };
            theTree.getEntityById = function (id) {
                if (this.Entities.id == id) {
                    return this.Entities
                }
                var theEntity = null;
                var more = true;
                var currentEntity, currentChild
                currentEntity = this.Entities.children[0];
                var GNum, SNum,
                    GNum = 0;
                SNum = 0;
                this.nodeFound = null;
                theEntity = this.searchBranchId(id, this.Entities);
                return theEntity;
            };
            theTree.getEntityByFn = function (v, fn) {
                if (fn(v, this.Entities)) {
                    return this.Entities;
                }
                var theEntity = null;
                var more = true;
                var currentEntity, currentChild
                currentEntity = this.Entities.children[0];
                var GNum, SNum;
                GNum = 0;
                SNum = 0;
                this.nodeFound = null;
                theEntity = this.searchBranchFn(v, fn, this.Entities);
                return theEntity;
            };
            theTree.getAreaMap = function () {
                var oAreaMap = {};
                var OfficeList = [];
                for (var x = 0; x < this.Entities.children.length; x++) {

                    var AreaOffice = {};
                    var aOffice = {};
                    var Officechildren = [];
                    AreaOffice = this.Entities.children[x];
                    aOffice.area = AreaOffice.code;
                    if (aOffice.area != "???") {
                        oAreaMap[AreaOffice.code] = {};
                        for (var x2 = 0; x2 < AreaOffice.children.length; x2++) {
                            var OLevel2;
                            OLevel2 = AreaOffice.children[x2];
                            if (OLevel2.code != "???") {
                                Officechildren.push(OLevel2.code);
                                for (var x3 = 0; x3 < OLevel2.children.length; x3++) {
                                    var oLevel3;
                                    oLevel3 = OLevel2.children[x3];
                                    if (oLevel3.code != "???") {
                                        Officechildren.push(oLevel3.code);
                                        for (var x4 = 0; x4 < oLevel3.children.length; x4++) {
                                            var oLevel4 = oLevel3.children[x4];
                                            if (oLevel4.code != "???") {
                                                Officechildren.push(oLevel4.code);
                                            }
                                        }
                                    }
                                }
                            }

                        }
                        aOffice.entities = Officechildren;
                        OfficeList.push(aOffice);
                    }

                }
                return OfficeList;
            };

            return theTree;
        }

        function getsublist() {
            var aEntityList = getEntityList();
            //Get Head...WHQ
            var aHead = aEntityList.filter(function (e) {
                return e.code == "WHQ"
            });
            //Ensure aHead not linked to itself...
            aHead[0].parentId = 0;
            var Sub = function (parent, dataIn, aSrc) {
                this.init(parent, dataIn, aSrc)
            };
            var p = Sub.prototype;
            p.code = null;
            p.id = null;
            p.data = null;
            p.aList = null;
            p.parentId = null;
            p.children = null;
            p.parent = null;
            p.init = function (parent, dataIn, aSrc) {
                this.parent = parent;
                for (p in dataIn) {
                    this[p] = dataIn[p];
                }
                if (!this.code) {
                    this.code = ""
                }
                ;
                this.code = this.code.trim();
                if (this.code == "") {
                    this.code = "???"
                }
                this.aList = aSrc;
                this.children = []; //new linkedList();
                //Remove this entry from this.aList;
                var idxfn = function (e) {
                    return e.id == dataIn.id;
                };
                var usedIdx = this.aList.indexOf(dataIn);
                if (usedIdx > -1) {
                    this.aList.splice(usedIdx, 1);
                }

                this.loadChildren(this, this.id, this.aList);

            };
            //p.childCount     = function(){return children.Size();} ;
            p.childCount = function () {
                return children.length;
            };
            //p.isChild        = function(sub) {return children.nodeExists(sub);} ;
            p.isChild = function (sub) {
                return children.indexOf(sub) > -1;
            };
            p.loadChildren = function (parentIn, idIn, aSrc) {
                idIn = idIn || this.id;
                aSrc = aSrc || this.aList;
                parentIn = parentIn || this.parent;
                var fltr = function (e) {
                    return e.parentId == idIn;
                };
                //this.children = aSrc.filter(fltr);
                var aClist = aSrc.filter(fltr);
                for (var i = 0; i < aClist.length; i++) {
                    var dataSub = aClist[i];
                    var oSub = new Sub(parentIn, dataSub, aSrc);
                    this.children.push(oSub);
                    //this.children.add(oSub);
                }
            };
            //---------------------------------------
            p.getNextSybling = function () {
                if (!this.parent) {
                    //top level
                    return null;
                }
                var idx = this.parent.children.indexOf(this);
                if (idx == -1) {
                    //log.debug("Child not found("+this.code+")");
                    return null;
                }
                if (idx + 1 < this.parent.children.length) {
                    //log.debug("next sybling is " + this.parent.children[idx+1].code);
                    return this.parent.children[idx + 1];
                } else {
                    //log.debug("No more children ("+this.code+")");
                    return null;
                }
            };
            p.getCodePath = function () {
                var r = this.code;
                var c = this;
                while (c.parent) {
                    c = c.parent;
                    r = r + "/" + c.code;
                }
                return r;
            };
            p.getFirstSybling = function () {
                if (!this.parent) {
                    return null;
                }
                ;
                if (this.parent.children.length > 0) {
                    //log.debug("First sybling is " + this.parent.children[0].code);
                    return this.parent.children[0];
                }
                //No sybling...
                //log.debug("No first sybling for " +this.code);
                return null;
            };
            p.getChild = function (code) {
                if (this.children.length == 0) {
                    return {};
                }
                for (var i = 0; i < this.children.length; i++) {
                    if (this.children[i].code == code) {
                        return this.children[i];
                    }
                }
                return null;
            }

            var oHead = new Sub(null, aHead[0], aEntityList);
            return oHead;
        }

        // End of Entity Tree Support
        //----------------------------------------------


        return {
            getEntityTree: getEntityTree
        };
    })