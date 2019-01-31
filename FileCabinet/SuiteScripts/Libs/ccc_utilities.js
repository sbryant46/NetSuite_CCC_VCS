/**
 * ccc_utilities.js
 * @NApiVersion 2.0
 * @NModuleScope Public
 *
 * JT: 1/2/2019 - Put gDrive and NSFiles into separate modules
 *     1/2/2018 - Tested on SB1 / Deployed to Production
 */
define(['N/runtime',
        'N/task',
        'N/config',
        'N/file',
        'N/search',
        'N/record',
        'N/format',
        'N/https',
        'N/currency',
        '/SuiteScripts/Libs/gDrive',
        '/SuiteScripts/Libs/NSFiles'],
    /**
     *
     */
    fnCCCUtils);

//const DEF_FOLDER_NAME = 'TransmittalData';
const LIB_VERSION = "1.0.0";
function fnCCCUtils(runtime,task,config,file,search,record,format,https,currency,gDrive,nsFiles)
{
    /**
     * @param fileConfig - fileConfig.fileName
     *
     */
    var CURRENCY_PRECISION_0 = ['JPY','IDR','KRW','LAK',
        'PYG','MGA','MMK','MRO','VND','CLP','VUV'];

    var COUNTRY_NAMES = [ 'Andorra', 'United Arab Emirates', 'Afghanistan',
        'Antigua and Barbuda', 'Anguilla', 'Albania', 'Armenia', 'Angola',
        'Antarctica', 'Argentina', 'American Samoa', 'Austria', 'Australia',
        'Aruba', 'Aland Islands', 'Azerbaijan', 'Bosnia and Herzegovina',
        'Barbados', 'Bangladesh', 'Belgium', 'Burkina Faso', 'Bulgaria',
        'Bahrain', 'Burundi', 'Benin', 'Saint Barthélemy', 'Bermuda',
        'Brunei Darrussalam', 'Bolivia', 'Bonaire, Saint Eustatius, and Saba',
        'Brazil', 'Bahamas', 'Bhutan', 'Bouvet Island', 'Botswana', 'Belarus',
        'Belize', 'Canada', 'Cocos (Keeling) Islands',
        'Congo, Democratic People\'s Republic', 'Central African Republic',
        'Congo, Republic of', 'Switzerland', 'Cote d\'Ivoire', 'Cook Islands',
        'Chile', 'Cameroon', 'China', 'Colombia', 'Costa Rica', 'Cuba',
        'Cape Verde', 'Curacao', 'Christmas Island', 'Cyprus',
        'Czech Republic', 'Germany', 'Djibouti', 'Denmark', 'Dominica',
        'Dominican Republic', 'Algeria', 'Ceuta and Melilla', 'Ecuador',
        'Estonia', 'Egypt', 'Western Sahara', 'Eritrea', 'Spain', 'Ethiopia',
        'Finland', 'Fiji', 'Falkland Islands', 'Micronesia, Federal State of',
        'Faroe Islands', 'France', 'Gabon', 'United Kingdom (GB)', 'Grenada',
        'Georgia', 'French Guiana', 'Guernsey', 'Ghana', 'Gibraltar',
        'Greenland', 'Gambia', 'Guinea', 'Guadeloupe', 'Equatorial Guinea',
        'Greece', 'South Georgia', 'Guatemala', 'Guam', 'Guinea-Bissau',
        'Guyana', 'Hong Kong', 'Heard and McDonald Islands', 'Honduras',
        'Croatia/Hrvatska', 'Haiti', 'Hungary', 'Canary Islands', 'Indonesia',
        'Ireland', 'Israel', 'Isle of Man', 'India',
        'British Indian Ocean Territory', 'Iraq', 'Iran (Islamic Republic of)',
        'Iceland', 'Italy', 'Jersey', 'Jamaica', 'Jordan', 'Japan', 'Kenya',
        'Kyrgyzstan', 'Cambodia', 'Kiribati', 'Comoros',
        'Saint Kitts and Nevis', 'Korea, Democratic People\'s Republic',
        'Korea, Republic of', 'Kuwait', 'Cayman Islands', 'Kazakhstan',
        'Lao People\'s Democratic Republic', 'Lebanon', 'Saint Lucia',
        'Liechtenstein', 'Sri Lanka', 'Liberia', 'Lesotho', 'Lithuania',
        'Luxembourg', 'Latvia', 'Libyan Arab Jamahiriya', 'Morocco', 'Monaco',
        'Moldova, Republic of', 'Montenegro', 'Saint Martin', 'Madagascar',
        'Marshall Islands', 'Macedonia', 'Mali', 'Myanmar', 'Mongolia',
        'Macau', 'Northern Mariana Islands', 'Martinique', 'Mauritania',
        'Montserrat', 'Malta', 'Mauritius', 'Maldives', 'Malawi', 'Mexico',
        'Malaysia', 'Mozambique', 'Namibia', 'New Caledonia', 'Niger',
        'Norfolk Island', 'Nigeria', 'Nicaragua', 'Netherlands', 'Norway',
        'Nepal', 'Nauru', 'Niue', 'New Zealand', 'Oman', 'Panama', 'Peru',
        'French Polynesia', 'Papua New Guinea', 'Philippines', 'Pakistan',
        'Poland', 'St. Pierre and Miquelon', 'Pitcairn Island', 'Puerto Rico',
        'Palestinian Territories', 'Portugal', 'Palau', 'Paraguay', 'Qatar',
        'Reunion Island', 'Romania', 'Serbia', 'Russian Federation', 'Rwanda',
        'Saudi Arabia', 'Solomon Islands', 'Seychelles', 'Sudan', 'Sweden',
        'Singapore', 'Saint Helena', 'Slovenia',
        'Svalbard and Jan Mayen Islands', 'Slovak Republic', 'Sierra Leone',
        'San Marino', 'Senegal', 'Somalia', 'Suriname', 'South Sudan',
        'Sao Tome and Principe', 'El Salvador', 'Sint Maarten',
        'Syrian Arab Republic', 'Swaziland', 'Turks and Caicos Islands',
        'Chad', 'French Southern Territories', 'Togo', 'Thailand',
        'Tajikistan', 'Tokelau', 'Turkmenistan', 'Tunisia', 'Tonga',
        'East Timor', 'Turkey', 'Trinidad and Tobago', 'Tuvalu', 'Taiwan',
        'Tanzania', 'Ukraine', 'Uganda', 'US Minor Outlying Islands',
        'United States', 'Uruguay', 'Uzbekistan',
        'Holy See (City Vatican State)', 'Saint Vincent and the Grenadines',
        'Venezuela', 'Virgin Islands (British)', 'Virgin Islands (USA)',
        'Vietnam', 'Vanuatu', 'Wallis and Futuna Islands', 'Samoa', 'Kosovo',
        'Yemen', 'Mayotte', 'South Africa', 'Zambia', 'Zimbabwe'];

    var COUNTRY_IDS = [ 'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR',
        'AS', 'AT', 'AU', 'AW', 'AX', 'AZ', 'BA', 'BB', 'BD', 'BE', 'BF', 'BG',
        'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS', 'BT', 'BV',
        'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL',
        'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ',
        'DK', 'DM', 'DO', 'DZ', 'EA', 'EC', 'EE', 'EG', 'EH', 'ER', 'ES', 'ET',
        'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF', 'GG',
        'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW',
        'GY', 'HK', 'HM', 'HN', 'HR', 'HT', 'HU', 'IC', 'ID', 'IE', 'IL', 'IM',
        'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM', 'JO', 'JP', 'KE', 'KG',
        'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC',
        'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME',
        'MF', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS',
        'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA', 'NC', 'NE', 'NF', 'NG',
        'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG',
        'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE',
        'RO', 'RS', 'RU', 'RW', 'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI',
        'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SX', 'SY',
        'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TM', 'TN', 'TO', 'TP',
        'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA',
        'VC', 'VE', 'VG', 'VI', 'VN', 'VU', 'WF', 'WS', 'XK', 'YE', 'YT', 'ZA',
        'ZM', 'ZW' ];

    var SUB_CURRENCY = [];

    function fileAsString(fileName)
    {
        return nsFiles.fileAsString(fileName);
    }
    /*-------------------------------------------------------------------------------------
     * Folder Functions.
     * These functions manipulate folders in the file cabinet in NetSuite
     *
     * getFolderId(folderName,parentID,lCreate)
     * createFolder(name,pId)
     *
     * getDefaultFolder()
     * getPathFolderId(path,lCreate)
     *
     *
     * ## Usage
     *  var fId = utils.getFolderId("TransmittalData") => Get the ID of Transmittal Folder
     *                                                    on the root folder
     *  var fId = utils.getFolderId("Export",45) => Returns the ID of the Export Folder
     *                                              found as a child of folder with ID = 45
     *  var fId = utils.getFolderId("KOR",345,true) => Gets the ID KOR as a child of
     *                                              folder #345. If KOR DNE - it is created
     * --------------------------------------------------------------------------------------
     */
    function runSearch(srchType,srchFilters,srchColumns)
    {
        var srch0 = search.create({
            type : srchType,
            filters: srchFilters,
            columns : srchColumns
        });
        return runSavedSearch(srch0);
    }
    /**
     * @param {search} - N/search
     * @param folderName
     * @param parentID (Optional)
     * @param lCreate (optional) - add folder if DNE
     * @returns {Number}
     */
    function getFolderId(folderName,parentID,lCreate)
    {
        return nsFiles.getFolderId(folderName, parentID, lCreate);
    }
    /**
     *
     * @param name
     * @param pId - Optional
     * @returns {Number}
     */
    function createFolder(name, pId) {
        return nsFiles.createFolder(name, pId);
    }
    /**
     *
     * @returns {Number}
     */
    function getDefaultFolder(pid)
    {

        return getFolderId(DEF_FOLDER_NAME,pid,true);

    }
    /**
     *
     * @param path
     * @param lCreate - Optional
     * @returns {Number}
     */
    function getPathFolderId(path,lCreate)
    {
        return nsFiles.getPathFolderId(path, lCreate);

    }
    function cleanFolder(fId,lAndSubs,lDelFolder)
    {
        return nsFiles.cleanFolder(fId, lAndSubs, lDelFolder);
    }
    function getSubFolders(folderId)
    {
        return nsFiles.getSubFolders(folderId);
    }
    function getFolderTree(cPath,id)
    {
        return nsFiles.getFolderTree(cPath, id);
    }
    function removeFolder(path,lDeleteFiles)
    {
        return nsFiles.removeFolder(path, lDeleteFiles);
    }
    function eraseFolder(folderId,fName)
    {
        return nsFiles.eraseFolder(folderId, fName);
    }
    /*-------------------------------------------------------------------------------------
     * File Functions.
     * These functions manipulate the files in the file cabinet in NetSuite
     * -------------------------------------------------------------------------------------
     */
    function eraseFile(id, fName) {
        return nsFiles.eraseFile(id, fName);
    }

    /**
     * @param fileName - name of file
     * @param contents - file contents (if binary file should be encoded base64
     * @param filePath - optional path in the file cab (must exist)
     */
    function stringToFile(fileName,contents,filePath)
    {
        return nsFiles.stringToFile(fileName, contents, filePath);
    }
    /**
     * @param fileConfig - fileConfig.contents,fileConfig.folder,fileConfig.isOnline, fileConfig.fileName, fileConfig.fileId
     */
    function saveFile(fileConfig)
    {
        return nsFiles.saveFile(fileConfig);
    }

    /**
     *
     * @param oResults - results of a search
     * @param fnRowFilter - filter function (default=function(row){return true} )
     * @param fnRowMap - Optional => Can add to default functionality of transformation function
     */
    function searchResultsToArray(oResults, fnRowFilter, fnRowMap, lp) {
        var colList;
        fnRowFilter = fnRowFilter || function (row) { return true; };
        if (Array.isArray(fnRowMap)) {
            //fnRowMap is really the columns!!
            colList = fnRowMap;
            fnRowMap = undefined;
            colList = colList.map(function (e) {
                // log.debug("LIST_ELEMENT", e);
                var n;
                n = (e.join ? e.join + '.' : '') + e.name;
                // log.debug("MAP: " + n + ' = ' + e.label);
                return { name: n, label: e.label };
            });
            //log.debug("COLLIST", colList);
        }
        //fnRowMap = fnRowMap || function(row){return row};
        //fnFilter2 = fnFilter2 || function(row){return true;};
        /*iterate over item (Native NS stru) and return flat array) */
        var lpIn = lp;
        var fnGetV = function (oI, cP) {
            var thisP = oI[cP];
            var retV = null;
            if (Array.isArray(thisP)) {
                /* Array of Objects? */
                if (thisP.length === 0) {
                    retV = '';
                }
                else {
                    if (lpIn)
                    {
                        //Preserve text & value
                        try {
                            retV = {};
                            try
                            {
                                retV.text = thisP[0].text;
                            }
                            catch (e1)
                            {
                                //error
                            }
                            try
                            {
                                retV.value = thisP[0].value;
                            }
                            catch (e2)
                            {
                                //Error
                            }
                        }
                        catch (eee)
                        {
                            //Error
                        }
                    }
                    else
                    {
                        //Use name of property to determine preference
                        var cP2 = cP;
                        if (Array.isArray(colList) && colList.length > 0)
                        {
                            var fmap = colList.filter(function (e1) {
                                return e1.name === cP;
                            });
                            if (fmap.length > 0)
                            {
                                cP2 = fmap[0].label;
                                // log.debug("FOUND " + cP);

                            }

                        }


                        if (cP2.toUpperCase().indexOf("_ID") > -1)
                        {
                            //log.debug("cP has _ID: " + cP2);
                            if (thisP[0].value)
                            {
                                retV = thisP[0].value;
                                if (isNaN(retV)) {
                                    retV = 0;
                                }
                            }
                            else
                            {
                                retV = thisP[0].text;
                            }

                        }
                        else
                        {
                            // log.debug("cP has NO _ID: " + cP);
                            if (thisP[0].text)
                            {
                                retV = thisP[0].text;
                            } else
                            {
                                retV = thisP[0].value;
                            }
                        }
                    }
                }
            } else {
                //Not an array
                retV = thisP;
            }

            return retV;
        };


        var retData = [];
        var oFiltered = [];

        oFiltered = oResults.filter(fnRowFilter);
        var item;
        retData = oFiltered.map(function (item, lp) {
            var V = {};
            var o = {};
            var prop;
            V = item.getAllValues();
            try {
                o.internalid = item.id;
            }
            catch (e) {
                //Do nothing
            }
            for (prop in V) {
                o[prop] = fnGetV(V, prop, lp);
            }
            return o;
        });
        if (typeof fnRowMap === "function") {
            retData = retData.map(fnRowMap);
        }
        if (Array.isArray(colList)) {
            try
            {
                // log.debug("ALLDATA-PRE", retData[0]);
            }
            catch (xxx)
            {
                //Error
            }

            retData = retData.map(function (e) {
                var r, i;
                r = {};
                i = 0; //May need to start th is at 0?
                for (p in e) {
                    if (Array.isArray(colList) && colList.length > 0) {
                        var msg;
                        msg = "P:" + p;

                        var fmap = colList.filter(function (e1) {
                            return e1.name === p;
                        });
                        if (fmap.length > 0) {
                            msg += "/FOUND";
                            r[fmap[0].label] = e[p];
                        }
                        else {
                            msg += "/NOT-FOUND";
                            //Could be duplicate field.. go on count!!!
                            if (i > -1 && i < colList.length) {
                                r[colList[i].label] = e[p];
                            }
                            else {
                                r[p] = e[p];
                            }
                            if (i === -1) {
                                // log.debug(msg);
                            }
                        }

                    }
                    else {
                        r[p] = e[p];
                    }
                    //if (i < colList.length && i > -1) {
                    //    log.debug("i=" + i + "/" + colList[i] + "/" + p);
                    //    r[colList[i]] = e[p];
                    //}
                    //else {
                    //    r[p] = e[p];
                    //}
                    i++;
                }
                return r;
            });
            try {
                //log.debug("ALLDATA-POST", retData[0]);
            } catch (xxx) {
                //Error
            };
        }
        //retData = retData.filter(fnFilter2)
        return retData;
    };
    /**
     * Returns all pages of a search in a single array (native NS object returned)
     * @param searchId || or search object!!
     * @param pgSize || or FilterArray
     * @returns {Array}
     */
    function runSavedSearch(searchId,pgSize,extraFilters,lUseLabels)
    {
        if(Array.isArray(pgSize)){
            extraFilters = pgSize;
            pgSize = 1000;
        }
        pgSize = pgSize || 1000;
        if(pgSize>1000){
            pgSize = 1000;
        }
        //var sss = getSearchStats(searchId,pgSize,extraFilters);
        //var listCount = sss.count ;
        //var pageCount = sss.pageRanges.length ;

        var srch1 = getSrchObj(searchId,extraFilters);

        log.debug("UTIL FILTERS", srch1.filters);
        var _i = 0 ;
        var rSSReturn = [];

        var procResults = function(result){
            //log.debug("procResults");
            if(Array.isArray(result)){
                rSSReturn.push.apply(rSSReturn,result);
            }
            else
            {
                rSSReturn.push(result);
            }
        }

        var myPagedData = srch1.runPaged({pageSize: pgSize});
        myPagedData.pageRanges.forEach(function(pageRange) {
            var myPage = myPagedData.fetch(pageRange);
            procResults(myPage.data); //.forEach(procResults);
        });
        if (lUseLabels) {
            rSSReturn = searchResultsToArray(rSSReturn, null, srch1.columns);
        }
        return rSSReturn ;

    }
    /*
     * Single Value array returned as filterArray
     */
    function arrayToFilterArray(aIn,fieldId,oper,join,lgrouped)
    {
        lgrouped = lgrouped || true;
        var aO = arrayToFilterExpression(aIn,fieldId,oper,join);
        var aF ;
        var oS= search.create({
            type: search.Type.FOLDER,
            filters :aO
        });
        aF = oS.filters;
        return aF;
    }
    /*
     * Single Value array returned as filter expression array
     */
    function arrayToFilterExpression(aIn,fieldId,oper,join){
        join = join || 'or';
        oper = oper || 'is';
        var aOut = [];

        for(var i=0;i<aIn.length;i++)
        {
            var flt;


            flt = [fieldId,oper,aIn[i]];



            if( i!=0)
            {
                aOut.push(join);
            }

            aOut.push(flt);
        }
        if(join=="or"){
            aOut = [aOut];
        }

        return aOut;
    }

    //Must be an array of filter objects...not filter expressions;
    function getSrchObj(sId,xf){
        var rs;
        if( sId!=null && typeof sId==="object")
        {
            //sId is search object passed in
            rs = sId;
        }
        else
        {
            rs = search.load({id: sId});
        }
        if(xf){
            //if(Array.isArray(xf)){
            //log.debug("getSrchObj","Adding filters: "+xf.length);
            rs.filters = addExtraFilter(rs.filters,xf);
            //rs.filters.push.apply(rs.filters,xf);
            //}
        }
        return rs;
    }
    function addExtraFilter(origF,xtraF,lJoinAsOr)
    {
        lJoinAsOr =lJoinAsOr || false;
        var newF = origF;
        if(Array.isArray(xtraF))
        {
            if(xtraF.length>0)
            {

                newF[newF.length-1].isor = lJoinAsOr;
                if(xtraF.length>1)
                {
                    xtraF[0].leftparens= 1;
                    xtraF[xtraF.length-1].rightparens =1;
                }
                for(var i=0;i<xtraF.length;i++)
                {
                    newF.push(xtraF[i]);
                }
            }

        }
        else
        { //Not an array a single filter
            newF[newF.length-1].isor = lJoinAsOr;
            newF.push(xtraF);
        }
        return  newF;
    }

    function getSearchFiltersAsExpressionArray(oSrch)
    {
        var aOut = [];
        for(f in oSrch.filters){
            var flt ;
            flt = oSrch.filters[f];
            var fltExp ;
            if (flt.leftparens>0)
            {
                var lp= flt.leftparens;
                do{
                    aOut.push("(");
                    lp--;
                }while(lp>0);
            }
            if(flt.isor)
            {
                aOut.push("or");
            }
            else
            {
                aOut.push("and");
            }
            if(flt.isnot)
            {
                aOut.push("not");
            }
            aOut.push([flt.name,flt.operator,flt.values]);
            if (flt.rightparens>0)
            {
                var rp= flt.rightparens;
                do{
                    aOut.push("(");
                    rp--;
                }while(rp>0);
            }
            //name = {string} custbody_ccc_src_transmittal_rec
            //operator = {string} noneof
            //values = {array} length=1
            //isor = {boolean} true
            //isnot = {boolean} false
            //leftparens = {number} 1
            //rightparens = {number} 0
        }
        return aOut;
    }
    function getSearchStats(searchId,pgSize,extraFilters)
    {
        pgSize = pgSize || 500;
        if(pgSize>1000){
            pgSize = 1000;
        }
        var srch = getSrchObj(searchId,extraFilters);

        return srch.runPaged({ pageSize: pgSize});
    }
    /**
     *
     * @param oData
     * @returns {String}
     */
    function arrayToCSVString(oData,fnRowMap)
    {

        return arrayToString(oData,',','\n',fnRowMap,'"');
    }
    function intToXLSColumn(i){
        var a,i100,i2,i10,r0,r10,r100
        a = i % 26 ;  //final letter code
        i100= parseInt(i  / 676.00);
        i2 = i  - (i100 * 676)
        i10 = parseInt(i2 / 26.00);

        r0 ="";
        r10 = "";
        r100 = "";
        r1 = "";

        r0 = String.fromCharCode(65+(a));
        r10 = i10==0 && i100==0 ? "" : String.fromCharCode(64+i10)
        r100= i100==0 ? "" : String.fromCharCode(64 + i100);
        r =  r100 + r10 + r0 ;
        return r;
    }
    function googleSheetToArray(cFileName,rPid,lNoHeaders){
        var cData;
        cData = gDrive.getGFile(cFileName,"text/csv",rPid);
        var aRet = [];
        try {
            aRet = CSVStringToArray(cData,lNoHeaders);
        }
        catch(e){}
        return aRet;

    }
    function CSVStringToArray(cData,lNoHeaders){
        var aRet = [];
        var aRaw = cData.split("\r\n");
        var aFlds;
        if(lNoHeaders){
            aFlds = aRaw[0].split(",");
            for(fi=0;fi<aFlds.length;fi++){
                //Support a large # of cols...more than A - Z
                var l1,l2;

                aFlds[fi] = intToXLSColumn(fi);
            }
        }
        else {
            aFlds = aRaw[0].split(",");
            //Remove Header line!!
            aRaw.splice(0,1);
        }

        var theCSVMap = function(cRaw){
            var o = {};
            var aThisRow = cRaw.split(",");
            for(i=0;i<aFlds.length;i++){
                var f = aFlds[i];
                o[f] = null;
                try {
                    o[f] = aThisRow[i];
                }
                catch(emap){}
            }
            return o;
        }
        aRet = aRaw.map(theCSVMap);

        return aRet;
    }
    function arrayToString(oData,cColDelim,cRowDelim,fnRowMap,cTextDelim)
    {
        cTextDelim = cTextDelim || "";
        var cData = "";
        fnRowMap = fnRowMap || function(item){
            var cLine = "";
            var pCcnt =0 ;
            if(typeof item==="string"){
                item = JSON.parse(item);
            }
            //log.debug("CSV Values",Object.keys(item));

            for(prop in item){
                var value = item[prop];
                try
                {
                    value = value.toString();
                }
                catch (ee) {
                    value = '';
                }

                if(!value || value===null){
                    value = '';
                }
                if (typeof value === "string") {
                    value = value.trim();
                }
                if(cTextDelim!=""){
                    value = cTextDelim + value + cTextDelim;
                }
                else {
                    //No TextDelim...therefore remove field delim from field value
                    value  = value.replace(/\,/g, '');
                }

                //log.debug(prop,value);
                //cLine += (pCcnt>0 ? cColDelim : '') + (item[prop]=== null ? '' : item[prop].toString().replace(cColDelim,''));
                cLine += (pCcnt>0 ? cColDelim : '') + value ; //(item[prop]=== null ? '' : item[prop].toString().replace(cColDelim,''));
                pCcnt++;

            }
            //log.debug("CSV Line",cLine);
            cLine += cRowDelim;
            return cLine;
        }
        var SingleLine = oData.map(fnRowMap);
        var ColHead = "";
        var oFirst = oData[0];
        if(typeof oFirst === "string"){
            oFirst = JSON.parse(oFirst);
        }
        ColHead = Object.keys(oFirst).join(',');

        //var cCnt = 0;
        //for(prop in oData[0]){
        //	ColHead += (cCnt>0 ? cColDelim : '') + prop ;
        //	cCnt++;
        //}
        ColHead+=cRowDelim;
        return ColHead + SingleLine.join('');
    }
    /*
     * Mass record manipulation
     */
    function massUpdate(oSrch, recordType, values) {
        var r = {};
        r.aFailedId = [];
        var UpdCnt = 0;
        var FailCnt = 0;
        var theCols = [];
        var oUpData;

        if (Array.isArray(oSrch))
        {
            oUpData = oSrch;
        }
        else
        {
            theCols.push(search.createColumn({ name: "internalid", label: "the_ID" }));
            oSrch.columns = theCols;
            oUpData = runSavedSearch(oSrch);
            oUpData = oUpData.map(function (e) {
                return e.id;
            });
        }

        recordType = recordType || oSrch.type;

        //---------------------------------------------
        // The Update Loop
        //---------------------------------------------
        var defMax = 100;
        for (var i = 0; i < oUpData.length & i<defMax; i++) {
            var id = oUpData[i];
            if (recordUpdate(recordType, id, values)) {
                UpdCnt++;
            }
            else {
                FailCnt++;
                r.aFailedId.push(id);
            }
        }
        //---------------------------------------
        r.UpdateCount = UpdCnt;
        r.FailCount = FailCnt;
        r.recordType = recordType;

        return r;
    }
    function recordUpdate(recordType, id, values) {
        var lRet = false;
        try {
            record.submitFields({
                type: recordType,
                id: id,
                values: values,
                options: {
                    ignoreMandatoryFields: true
                }
            });
            lRet = true;
        }
        catch (e) {
            lRet = false;
        }
        return lRet;
    }

    /*
        function massRecordDelete(recordType,filters)
        {
            var HowManyFound = 0;
            var HowManyDeleted=0;
            filters = filters || [];
            var objR;
            objR = runSearch(recordType,filters,['internalid']);
            var item;
            HowManyFound = objR.length;
            var e;
            for(var i=0;i<objR.length;i++)
            {
                item = objR[i];
                var recToDelete = item.getValue('internalId');

                try {
                    var objNewRecord = record.delete ({
                        type: recordType,
                        id: recToDelete,
                    });
                    HowManyDeleted++;
                    log.debug("Deleted: "+recordType+"/ id: "+recToDelete);
                }
                catch(e){
                    log.debug("Error Deleting: "+recordType+"/ id: "+recToDelete);
                }
            }
            var oRet = {};
            oRet.found = HowManyFound;
            oRet.deleted = HowManyDeleted;
            return oRet;
        }

        function massRecordUpdate(recordType,fnUpdateMap,filters)
        {
            filters = filters || [];
            var objRecord = search.create.promise({
                    type: recordType,
                    columns: [
                        'internalid', // The record's ID
                    ],
                    filters: []// no filters
                }).then(function (result) {
                    var HowManyFound = 0;
                    var HowManyUpdated = 0;
                    result.run().each(function (rl) {
                        HowManyFound++;
                        var recToUpdate = rl.getValue('internalId');
                        var objRec = record.load({
                                type: recordType,
                                id: recToUpdate,
                            });
                        try {
                            fnUpdateMap(objRec);
                            objRec.save();
                            HowManyUpdated++;
                        }
                        catch(e){
                            //Error in Update function or cannot update
                            log.debug("Error Updating Record",recordType+":"+recToUpdate);
                         }
                        return true;
                    });
                   log.debug("Total In Query",HowManyFound);
                   log.debug("Total Updated",HowManyUpdated);

                }).catch (function (reason) {
                    log.debug("Failed: " + reason);
                });
        }
    */
    //-----------------------------------------
    /*
     * Ensure that a deployment exists for this country code
     * NOTE: A single deployment cannot be running more than
     *       once. Therefore, ensure that a deployment exists
     *       for this country code and then use that deployment
     *       to initiate another MAP REDUCE task to update the
     *       transmittal data with the correct Export Batch ID
     *
     * Parameter defaults are for the originating case:
     *    Transmittal Batch ID Update
     */
    function getDeploymentId(code, targetBase, baseName, defId)
    {
        targetBase = targetBase || "customdeploy_ccc_trans_batch_upd_";
        baseName = baseName || "Transmittal Batch ID Update";
        var targetId;

        targetId = targetBase + code.toLowerCase();
        defId = defId || "customdeploy_ccc_trans_batch_upd_xxx";
        //log.debug("searching for "+targetId);
        var srch;
        var aDeploys=[];
        var raw;
        var osrch;
        osrch = search.create({
            type: "scriptdeployment",
            filters:
                [
                    ["scriptid","is",targetId]
                ],
            columns:
                [
                    search.createColumn({
                        name: "title",
                        sort: search.Sort.ASC,
                        label: "Title"
                    }),
                    search.createColumn({name: "scriptid", label: "Custom ID"})

                ]
        });
        var searchResultCount = osrch.runPaged().count;
        //log.debug("scriptdeploymentSearchObj result count",searchResultCount);
        if(searchResultCount===0)
        {
            log.debug("About to create deployment");
            //Deployment DNE!!!...create it!!!
            //---------------------------------------------
            var osrchdef;
            var defInternalId;
            osrchdef = search.create({
                type: "scriptdeployment",
                filters:
                    [
                        ["scriptid","is",defId]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "title",
                            sort: search.Sort.ASC,
                            label: "Title"
                        }),
                        search.createColumn({name: "scriptid", label: "Custom ID"})
                    ]
            });
            osrchdef.run().each(function(result){
                defInternalId = result.id;
                return true;
            });
            log.debug("Copying Record (id=" + defInternalId + ")", targetId);
            if (defInternalId) {
                var objR = record.copy({
                    type: record.Type.SCRIPT_DEPLOYMENT,
                    id: defInternalId
                });
                var newId;
                newId = targetId.replace("customdeploy", "");
                var newName;
                newName = baseName + " " + code.toUpperCase();

                objR.setValue("scriptid", newId);
                objR.setValue("name", newName);
                log.debug("New Deploy ID: " + newId);
                log.debug("New Name: " + newName);
                try {
                    objR.save();

                    log.debug("Created Deployment", targetId);
                }
                catch (eee) {
                    log.debug("DEPLOY NOT CREATED", eee);
                }
            }
            else {
                //defInternalId DNE !! default defId does not exists!!!
                log.debug("SCRIPT ID DNE!!", defId);
                targetId = null;
            }
            //---------------------------------------------
            //End of Deployment DNE
        }
        else
        {
            //Deployment exists
            log.debug("Deployment "+targetId+" Exists");
        }
        return targetId;

    }
    //----------------------------------------------------------
    // Create Task Wrapper
    //Attempt to launch the deployId passed...
    //If fails, then create a new deployment using "code" passed
    // or generated and try to run that task
    //---------------------------------------------------------
    function createAndSubmitTask( deployId, scriptId,code, descript, params, taskTypeIn) {
        var lRet = false;
        var oRet = {};
        oRet.submitted = lRet;
        oRet.taskId = "";

        code = code || randomString(5);
        taskTypeIn = taskTypeIn || task.TaskType.MAP_REDUCE;
        log.audit("Deploy code: " + code);
        descript = descript || 'Auto Create Deployment';
        var deployBase,dId;
        var t = task.create({ taskType: taskTypeIn });
        t.scriptId = scriptId;
        if (params) {
            t.params = params;
        }
        //t.deploymentId = deployId; // Take any available deployment
        // t.scriptId = scriptId;
        //Don't set deploymentId so as to get any currently available deployment
        try {
            oRet.taskId = t.submit();
            log.audit(descript + " Task submitted (default)", scriptId);
            lRet = true;
            oRet.submitted = lRet;
        }
        catch (e) {
            //No Deployment available ... create a new deployment
            //var newCode = randomString(code.length);
            log.audit("No Deployment Available", scriptId);
            deployBase = newDeployId(code, deployId);
            dId = utils.getDeploymentId(code, deployBase, descript, deployId);
            t = task.create({ taskType: taskTypeIn });
            t.scriptId = scriptId;
            if (params) {
                t.params = params;
            }
            t.deploymentId = dId;
            try {
                oRet.taskId = t.submit();
                log.audit(descript + " Task submitted", dId);
                lRet = true;
                oRet.submitted = lRet;
            }
            catch (e2) {
                log.audit("Deploy Code Failed", code);
                //Try with a random code...
                var newCode = randomString(code.length);
                deployBase = newDeployId(newCode, deployId);
                dId = utils.getDeploymentId(code, deployBase, descript, deployId);
                t = task.create({ taskType: taskTypeIn });
                t.scriptId = scriptId;
                if (params) {
                    t.params = params;
                }
                t.deploymentId = dId;
                try {
                    oRet.taskId =  t.submit();
                    log.audit(descript + " Task submitted", dId);
                    lRet = true;
                    oRet.submitted = lRet;
                }
                catch (e3) {
                    lRet = false;
                    oRet.submitted = lRet;
                }
            }
        }
        oRet.submitted = lRet;
        return oRet;
    }
    //Internal support
    function newDeployId(code, deployId) {
        code = code || randomString(5);
        var deployBase;
        if (deployId.indexOf("_") > -1) {
            var aBase = deployId.split("_");
            aBase.pop();
            deployBase = aBase.join("_") + "_";
            if (deployBase.length + code.length > 40) {
                deployBase = deployBase.substring(0, 40 - code.length - 1);
            }
        }
        else {
            deployBase = (deployId.length > (40 - code.lentgh - 1)) ? deployId.substring(0, (40 - code.lentgh - 1)) : deployId;
        }
        return deployBase;
    }
    //-----------------------------------------
    /*
     * Create Transmittal Export Batch!
     *
     */
    function createTransmittalExportBatch(oP){
        var d = new Date();
        var bId = "";
        var bRet = {id: 0,name: ""}
        if(oP){
            if(oP.batch){
                bRet  = oP.batch;
                //log.debug("Using Existing Batch "+bRet.name);
                return bRet;
            }
        }
        bId = d.getFullYear()+"_"+d.getMonth()+"_"+d.getDay();
        try
        {
            var recOjb;
            recObj = record.create({
                type: "customrecord_ccc_transmittal_exp_batch"
            });
            bId = recObj.save({});

            var oBr;
            oBr = record.load({
                type: "customrecord_ccc_transmittal_exp_batch",
                id : bId
            });
            var b2;
            bRet ={id: oBr.getValue("id"), name: oBr.getValue("name")};
        }
        catch(e)
        {
            bId = d.getFullYear()+"_"+d.getMonth()+"_"+d.getDay();
            catchError("createTransmittalExportBatch",e);
        }


        //log.debug(bRet);


        return bRet;
    }
    //-----------------------------------------
    function catchError(eCtx,e){
        var oRet = {
            name: "Invalid JSON",
            message: "The error string passed to catchError is not valid JSON",
            type: "error.NetSuiteError",
            id: "-100"
        };
        var fullMSG = "";
        if(e !== null && typeof e === "object")
        {
            oRet = e;
            fullMSG = 'Native Error Object \n';
        }
        else
        {
            try
            {
                oRet = JSON.parse(e);
            }
            catch(e2)
            {
                oRet = {
                    name: "Invalid JSON",
                    message: "The error string passed to catchError is not valid JSON",
                    type: "error.NetSuiteError",
                    id: "-100"
                };
            }
        }
        fullMSG += "Error:   " + oRet.name+'\n'+ "Message: " + oRet.message;

        if(oRet.type === "error.NetSuiteError"){
            fullMSG = oRet.message +'\n'+e;
        }
        if(oRet.type ==="error.SuiteScriptError"){
            fullMSG = fullMSG +'\n'+
                "ID: "          + oRet.id + '\n' +
                'Cause: '       + oRet.cause + '\n' +
                'Stack Trace: ' + oRet.stack ;
        }
        if(oRet.type=="error.UserEventError"){
            fullMSG = fullMSG +'\n'+
                "ID: "          + oRet.id + '\n' +
                'Event Type:'   + oRet.eventType + '\n' +
                'Record ID: '   + oRet.recordId + '\n' +
                'Stack Trace: ' + oRet.stack ;
        }
        log.debug(eCtx,fullMSG);
        oRet.fullMSG = fullMSG;
        return oRet;

    }
    //------------------------------------------
    function getError(__e,eCtx){
        var oErr = {}
        eCtx  = eCtx || "Generic Error Catch";
        oErr = catchError(eCtx,__e);

        return oErr;
    }
    function errMsg(_e,eCtx)
    {
        eCtx  = eCtx || "Generic Error Catch";
        var _internalId = 0;
        try{
            _internalId = nlapiGetRecordId();

            if(!(typeof _internalId==='number' && (_internalId%1)===0)) {
                _internalId = 0;
            }
        }
        catch(_e1){}

        var txt='';
        if (_e instanceof nlobjError) {
            //this is netsuite specific error
            txt = 'NLAPI Error: Record ID :: '+_internalId+' :: '+_e.getCode()+' :: '+_e.getDetails() + ' :: ' + _e.getStackTrace().join(', ');
        } else {
            //this is generic javascript error
            txt = 'JavaScript/Other Error: Record ID :: '+_internalId+' :: '+_e.toString()+' : '+_e.stack;
        }
        return txt;
    }
    //-------------------------------------------
    //Entity Tree Support
    function getEntityList(nIDin, cCodeIn) {
        var eFilters = [];
        if (nIDin)
        {
            eFilters = [
                ["internalidnumber", "equalto", nIDin]
            ];
        }
        if (cCodeIn)
        {
            eFilters = [
                ["custrecord_ccc_entity_code", "is", cCodeIn]
            ];
        }
        var srch =  search.create({
            type: "account",
            filters:
                [
                    ["type","anyof","Bank"]
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
                    search.createColumn({ name: "subsidiarynohierarchy", label: "Entity (no hierarchy)" }),
                    search.createColumn({ name: "custrecord_ccc_sto_saved_search",label:"Standing Order SS"})
                ]
        });
        var od,d1,banks;
        var plh;
        od = runSavedSearch(srch);
        d1 = searchResultsToArray(od,plh,plh,true);
        banks = d1.map(function(e){
            var r = {};
            r.accountId = e.internalid;
            r.accountName = e.name;
            r.accountType = e.type.value;
            r.entityName =  e.subsidiarynohierarchy.text;
            r.entityId = e.subsidiarynohierarchy.value;
            r.stoSS = e.custrecord_ccc_sto_saved_search.value;   //Add Account's STO saved search
            return r;
        });
        var subSrch =  search.create({
            type: "subsidiary",
            filters: eFilters  ,
            columns:
                [
                    search.createColumn({name: "internalid", label: "internalid"}),
                    search.createColumn({ name: "custrecord_ccc_entity_code", label: "custrecord_ccc_entity_code"}),
                    search.createColumn({ name: "namenohierarchy", label: "namenohierarchy"}),
                    search.createColumn({name: "parent", label: "parent"}),
                    search.createColumn({name: "country", label: "country"}),
                    search.createColumn({name: "currency", label: "currency"}),
                    search.createColumn({name: "language", label: "language"}),
                    search.createColumn({ name: "custrecord_ccc_is_consolidation_sub", label: "custrecord_ccc_is_consolidation_sub"}),
                    search.createColumn({ name: "iselimination", label: "iselimination" }),
                    search.createColumn({ name: "custrecord_ccc_donation_rec_temp_def",label: "RTemplate_ID"})
                ]
        });
        var oSr = runSavedSearch(subSrch);
        oSr = searchResultsToArray(oSr,false,subSrch.columns);

        var mapper = function(e){
            //This defines the actual data of the "Entity Node" object
            var r = {} ;
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

            r.countryCode = '??' ;
            var ccIdx = COUNTRY_NAMES.indexOf(e.country);
            if(ccIdx>-1){
                r.countryCode = COUNTRY_IDS[ccIdx];
            }
            //Bank Accounts!
            r.bankAccount = "";
            var ba = banks.filter(function(e){
                return e.entityId === r.id;
            });

            r.bankAccount=ba;
            r.RTemplate_ID = e.RTemplate_ID;
            return r;
        }
        oSr = oSr.map(mapper);
        return oSr;
    }
    function getEntityTree()
    {
        var theTree = {};
        theTree.areaMap = [];
        theTree.Entities = getsublist();
        theTree.firstInCountryCode = function(c){

        }
        theTree.isInCountryCode = function(o,cc){ return o.countryCode==cc ;};
        theTree.getChildrenInCountryCode = function(p,cc){
            var fn = function(e) { return e.countryCode==cc;};
            return this.getChildren(p,fn);
        }
        theTree.getChildren = function(p,fn){
            var cl = [];
            cl = p.children.filter(fn);
            return cl;
        }
        theTree.getAreaOffice = function(ent){
            if(!ent){return null};
            if(!ent.parent)
            {
                return ent;
            }
            if(ent.parent.code=="WHQ")
            {
                return ent;
            }
            var areaEnt = null;
            var currEnt = ent;
            while(!areaEnt)
            {
                if(currEnt.parent.code=="WHQ")
                {
                    areaEnt = currEnt;
                }
                else
                {
                    try
                    {
                        currEnt = currEnt.parent;
                    }
                    catch(e)
                    {
                        //Parent Expected...
                        return null;
                    }
                }
            }
            return areaEnt;
        }
        theTree.nodeFound = null;
        theTree.searchBranchFn = function(v,fn,node){
            if(this.nodeFound!=null){ return this.nodeFound};
            if(!node){return null};

            if (fn(v,node))
            {
                this.nodeFound = node;
                log.debug("Node Found!");
                return node;
            }
            if (node.children.length>0)
            {
                for(var i=0;i<node.children.length;i++)
                {
                    if(this.nodeFound==null)
                    {
                        //oNode = this.searchBranchFn(this.searchBranchFn(v,fn,node.children[i]));
                        oNode = this.searchBranchFn(v,fn,node.children[i]);
                        if(oNode)
                        {
                            this.nodeFound = oNode;
                            return oNode;
                        }
                    }
                    else
                    {
                        return this.nodeFound;
                    }
                }
            }
            //log.debug("Node not found in branch: "+node.getCodePath());
            return null;

        }
        theTree.searchBranchCountryCode = function(cc,node){
            if(this.nodeFound!=null){ return this.nodeFound};
            if(!node){return null};

            if (node.country==cc)
            {
                this.nodeFound = node;
                log.debug("Node Found!");
                return node;
            }
            if (node.children.length>0)
            {
                for(var i=0;i<node.children.length;i++)
                {
                    if(this.nodeFound==null)
                    {
                        //oNode = this.searchBranchCountryCode(this.searchBranchCountryCode(cc,node.children[i]));
                        oNode = this.searchBranchCountryCode(cc,node.children[i]);
                        if(oNode)
                        {
                            this.nodeFound = oNode;
                            return oNode;
                        }
                    }
                    else
                    {
                        return this.nodeFound;
                    }
                }
            }
            //log.debug("Node not found in branch: "+node.getCodePath());
            return null;


        }
        theTree.searchBranchId = function(id,node) {
            if(this.nodeFound!=null){ return this.nodeFound};
            if(!node){return null};
            //log.debug(code + " => "+node.getCodePath());
            if (node.id==id)
            {
                this.nodeFound = node;
                log.debug("Node Found!");
                return node;
            }
            if (node.children.length>0)
            {
                for(var i=0;i<node.children.length;i++)
                {
                    if(this.nodeFound==null)
                    {
                        //oNode = this.searchBranchId(this.searchBranchId(id,node.children[i]));
                        oNode = this.searchBranchId(id,node.children[i]);
                        if(oNode)
                        {
                            this.nodeFound = oNode;
                            return oNode;
                        }
                    }
                    else
                    {
                        return this.nodeFound;
                    }
                }
            }
            //log.debug("Node not found in branch: "+node.getCodePath());
            return null;

        }
        theTree.searchBranch = function(code,node) {
            if (this.nodeFound != null) { return this.nodeFound;}
            if (!node) { return null;}
            //log.debug(code + " => "+node.getCodePath());
            if (node.code===code)
            {
                this.nodeFound = node;
                //log.debug("Node Found!");
                return node;
            }
            if (node.children.length>0)
            {
                for(var i=0;i<node.children.length;i++)
                {
                    if(this.nodeFound==null)
                    {
                        //oNode = this.searchBranch(this.searchBranch(code,node.children[i]));
                        oNode = this.searchBranch(code,node.children[i]);
                        if(oNode)
                        {
                            this.nodeFound = oNode;
                            return oNode;
                        }
                    }
                    else
                    {
                        return this.nodeFound;
                    }
                }
            }
            //log.debug("Node not found in branch: "+node.getCodePath());
            return null;

        }
        theTree.getEntity = function(code)
        {
            if(this.Entities.code == code){ return this.Entities}
            var theEntity = null;
            var more = true;
            var currentEntity, currentChild;
            currentEntity = this.Entities.children[0];
            var GNum, SNum;
            GNum =0;
            SNum = 0;
            this.nodeFound = null;
            theEntity = this.searchBranch(code,this.Entities);
            return theEntity;
        }
        theTree.getEntityById = function(id)
        {
            if(this.Entities.id == id){ return this.Entities}
            var theEntity = null;
            var more = true;
            var currentEntity,currentChild
            currentEntity = this.Entities.children[0];
            var GNum,SNum,
                GNum =0;
            SNum = 0;
            this.nodeFound = null;
            theEntity = this.searchBranchId(id,this.Entities);
            return theEntity;
        }
        theTree.getEntityByFn = function(v,fn)
        {
            if (fn(v, this.Entities)) { return this.Entities; }
            var theEntity = null;
            var more = true;
            var currentEntity,currentChild
            currentEntity = this.Entities.children[0];
            var GNum, SNum;
            GNum =0;
            SNum = 0;
            this.nodeFound = null;
            theEntity = this.searchBranchFn(v,fn,this.Entities);
            return theEntity;
        }
        theTree.getAreaMap = function () {
            var oAreaMap = {};
            var OfficeList = [];
            for (var x = 0; x < this.Entities.children.length; x++) {

                var AreaOffice = {};
                var aOffice = {};
                var Officechildren = [];
                AreaOffice = this.Entities.children[x];
                aOffice.area = AreaOffice.code;
                if (aOffice.area != "???")
                {
                    oAreaMap[AreaOffice.code] = {};
                    for (var x2 = 0; x2 < AreaOffice.children.length; x2++) {
                        var OLevel2;
                        OLevel2 = AreaOffice.children[x2];
                        if (OLevel2.code != "???")
                        {
                            Officechildren.push(OLevel2.code);
                            for (var x3 = 0; x3 < OLevel2.children.length; x3++)
                            {
                                var oLevel3;
                                oLevel3 = OLevel2.children[x3];
                                if (oLevel3.code != "???")
                                {
                                    Officechildren.push(oLevel3.code);
                                    for (var x4 = 0; x4 < oLevel3.children.length; x4++)
                                    {
                                        var oLevel4 = oLevel3.children[x4];
                                        if (oLevel4.code != "???")
                                        {
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
        var aHead = aEntityList.filter(function(e){return e.code=="WHQ"});
        //Ensure aHead not linked to itself...
        aHead[0].parentId = 0;
        var Sub = function(parent,dataIn,aSrc) {this.init(parent,dataIn,aSrc)};
        var p = Sub.prototype;
        p.code = null;
        p.id   = null;
        p.data = null;
        p.aList = null;
        p.parentId = null;
        p.children = null;
        p.parent = null;


        p.init = function(parent,dataIn,aSrc){
            this.parent = parent;
            for( p in dataIn){
                this[p] = dataIn[p];
            }
            if(!this.code){this.code=""};
            this.code = this.code.trim();
            if(this.code==""){this.code="???"}
            this.aList		  =  aSrc;
            this.children     =  []; //new linkedList();
            //Remove this entry from this.aList;
            var idxfn = function(e) { return e.id == dataIn.id ;};
            var usedIdx = this.aList.indexOf(dataIn);
            if(usedIdx> -1){
                this.aList.splice(usedIdx,1);
            }

            this.loadChildren(this,this.id,this.aList);

        }
        //p.childCount     = function(){return children.Size();} ;
        p.childCount     = function(){return children.length;} ;
        //p.isChild        = function(sub) {return children.nodeExists(sub);} ;
        p.isChild		 = function(sub) { return children.indexOf(sub)>-1;} ;
        p.loadChildren   = function(parentIn,idIn,aSrc)
        {
            idIn = idIn || this.id;
            aSrc = aSrc || this.aList;
            parentIn = parentIn || this.parent;
            var fltr = function(e){return e.parentId == idIn;};
            //this.children = aSrc.filter(fltr);
            var aClist = aSrc.filter(fltr);
            for(var i =0;i<aClist.length;i++)
            {
                var dataSub = aClist[i];
                var oSub = new Sub(parentIn,dataSub,aSrc);
                this.children.push(oSub);
                //this.children.add(oSub);
            }
        };
        //---------------------------------------
        p.getNextSybling = function(){
            if(!this.parent){
                //top level
                return null;
            }
            var idx = this.parent.children.indexOf(this);
            if(idx==-1){
                //log.debug("Child not found("+this.code+")");
                return null;
            }
            if(idx+1<this.parent.children.length){
                //log.debug("next sybling is " + this.parent.children[idx+1].code);
                return this.parent.children[idx+1];
            } else {
                //log.debug("No more children ("+this.code+")");
                return null;
            }
        }
        p.getCodePath = function(){
            var r = this.code;
            var c = this;
            while(c.parent)
            {
                c = c.parent;
                r = r + "/"+ c.code;
            }
            return r;
        }
        p.getFirstSybling = function(){
            if(!this.parent){ return null;};
            if(this.parent.children.length>0){
                //log.debug("First sybling is " + this.parent.children[0].code);
                return this.parent.children[0];
            }
            //No sybling...
            //log.debug("No first sybling for " +this.code);
            return null;
        }
        p.getChild = function(code) {
            if (this.children.length ==0){
                return {};
            }
            for(var i=0;i<this.children.length;i++)
            {
                if(this.children[i].code ==code)
                {
                    return this.children[i];
                }
            }
            return null;
        }
        //------------------------------------------------------------
        //File IO
        //------------------------------------------------------------
        // TODO: Create IO functions for gDrive & NS File Cabinet
        //-----------------------------------------------------------
        var oHead = new Sub(null,aHead[0],aEntityList);
        return oHead;
    }
    // End of Entity Tree Support
    //----------------------------------------------
    function linkedList(){
        this.length = 0;
        this.head = null;

        var Node = function(data){
            this.data =data;
            this.next = null;
        };
        this.size = function(){	return this.length;};

        this.add  = function(data)
        {
            var node = new Node(data);
            if(this.head ===  null)
            {
                this.head = node;
            }
            else
            {
                var currentNode = this.head;
                while(currentNode.next)
                {
                    currentNode = currentNode.next;
                }
                currentNode.next = node;
            }
            this.length++;
        }
        this.remove = function(data)
        {
            var currentNode = this.head;
            var previousNode;
            if(currentNode.data === data)
            {
                this.head = currentNode.next;
            }
            else
            {
                while(currentNode.data !== data)
                {
                    previuisNode = currentNode;
                    currentNode = currentNode.next;
                }
                previousNode.next = currentNode.next;
            }
            this.length--;
            //---------------------------
        }
        this.isEmpty = function(){return this.length ===0}
        this.indexOf = function(data)
        {
            var currentNode = this.head;
            var index = -1;
            while(currentNode)
            {
                index++;
                if(currentNode.data === data){ return index;}
                currentNode = currentNode.next;
            }
            return -1;
        }
        this.nodeExists = function(node)
        {
            var currentNode = this.head;
            var r = false;
            r = currentNode === node ;
            while(!r && currentNode.next)
            {
                currentNode = currentNode.next;
                r = currentNode === node;
            }
            return r;
        }
        //Index can be a number or it can be an object
        this.nodeAt = function (index) {
            if (typeof index === 'object' && index !== null) {
                var theNode = this.head;
                var rNode = null;

                for (i = 0; i < this.length; i++) {
                    if (this.isEqual(theNode.data, index)) {
                        return theNode;
                    }
                    else {
                        theNode = theNode.next;
                    }
                }
                //If I get here it was not found;
                return null;
            }
            else {
                if (index < 0 || index > this.length) { return null; }
                var currentNode = this.head;
                var count = 0;
                while (count < index) {
                    count++;
                    currentNode = currentNode.next;
                }
                return currentNode;
            }
        };
        this.addAt	= function(index,data)
        {
            if(index > this.length){return null;}
            if(index < 0){return null;}
            var newNode = new Node(data);
            var theNode = this.nodeAt(index);
            if(index=== 0)
            {
                //Changing the head..putting at front of line!
                newNode.next = this.head;
                this.head = newNode;
                this.length++;
                return newNode;
            }
            var thePreviousNode = this.nodeAt(index-1);
            newNode.next = theNode;
            thePreviousNode.next = newNode;
            this.length++;
            return newNdoe;
        }
        this.removeAt  = function(index)
        {
            if(this.empty()){return null;}
            if(index===0)
            {
                //removing head!!
                this.head = head.next;
                this.length--;
                return null;
            }
            var targetNode = this.nodeAt(index);
            if(targetNode===null) { return null };
            var previousNode = this.nodeAt(index-1);
            if(previousNode===null){ return null };
            previousNode.next = targetNode.next;
            this.length--;
        }
        this.isEqual = function (data1, data2) {
            return isObjectEqual(data1, data2);
        }

    }
    function isObjectEqual(data1, data2) {
        //Is it the same location in memory?
        if (data1 === data2) { return true;}
        //the simple way.. stringify and compare
        var str1, str2;
        try {
            str1 = JSON.stringify(data1);
            str2 = JSON.stringify(data2);
            return str1 === str2;
        }
        catch (e) {
            //Objects must contain self refrence
            return false;
        }

    }
    function isDateInOpenPeriod(dateIn)
    {
        log.debug("DateIn",dateIn);

        if(dateIn==null){return false;}

        var accountingperiodSearchObj = search.create({
            type: "accountingperiod",
            filters:
                [
                    ["closed","is","F"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "periodname",
                        sort: search.Sort.ASC,
                        label: "Name"
                    }),
                    search.createColumn({name: "startdate", label: "Start Date"}),
                    search.createColumn({name: "enddate", label: "End Date"})
                ]
        });
        var oPeriods = runSavedSearch(accountingperiodSearchObj);

        var flt;
        var mapfn = function(e) {
            var r ;
            r = e;
            r.startdate  = format.parse({
                value: r.startdate,
                type : format.Type.DATE
            });
            r.enddate = format.parse({
                value: r.enddate,
                type : format.Type.DATE
            });
            return r;
        }
        oPeriods = searchResultsToArray(oPeriods,flt,mapfn);

        dateIn = format.parse({value: dateIn,type: format.Type.DATE});
        log.debug("Converted DateIn",dateIn);

        var lRet = false;
        for(var i=0;i<oPeriods.length;i++)
        {
            var p = oPeriods[i];
            if(dateIn>= p.startdate && dateIn<=p.enddate)
            {
                lRet = true;
                i = oPeriods.length+1 ;
            }
        }
        return lRet;
    }

    function platform(){
        var co = config.load({
            type: config.Type.COMPANY_INFORMATION
        });
        var company = co.getText("companyname");
        var p = {};
        p.company = company;
        if(p.company.indexOf("Sandbox")>-1 || p.company.indexOf("SB1")>-1 || p.company.indexOf("QA")>-1 || p.company.indexOf("UAT")>-1 || p.company.indexOf("Training")>-1){
            p.type="SandBox";
        }
        if(p.company.indexOf("Development Account")>-1){
            p.type="Development";
        }
        if(!p.type){
            p.type="Production";
        }
        if(p.type=="Production"){
            p.testing = false;
        }else {
            p.testing = true;
        }
        p.companyid = co.getValue("companyid");
        //Set the url!!
        if (p.testing) {
            p.baseUrl = "https://system.netsuite.com";
        }
        else {
            p.baseUrl = "https://system.na2.netsuite.com";
        }
        var TDInfo;
        TDInfo = gDrive.getTeamDriveRoot(p.companyid);
        p.gDriveId =TDInfo.gDriveId;
        p.gDrivePath=TDInfo.gDrivePath;
        return p;
    }
    //-----------------------------------------
    //JT USED by getEntityTree..the entity model
    //------------------------------------------
    function currencyPrecision(curr) {

        var precision = 2;
        if(CURRENCY_PRECISION_0.indexOf(curr)>-1){
            precision = 0;
        }
        return precision;
    }

    function getCurrencyZEROarray() {
        return CURRENCY_PRECISION_0;
    }

    function createEntityMap() {
        var et;
        var am, amJSON;
        et = utils.getEntityTree();

        am = et.getAreaMap();


    }
    function randomString(len) {
        len = len || 10;
        var rndRet;
        rndRet = new Array(len).join().replace(/(.|$)/g, function () { return ((Math.random() * 36) | 0).toString(36); });
        return rndRet;
    }
    //--------------------------------------------
    /*
   * Figure out Entity's Parent/Area Folder
   *
   */
    function getArea(code, theTree) {
        //for speed.. hard code the tree structure
        var defTree = [
            { "area": "AAOP", "entities": ["AEP", "NHK", "CHNC", "CNI", "CNB", "CNE", "CNH", "CNA", "CNG", "CND", "CNF", "CNC", "CHEC", "CHEB", "CHEH", "CHFC", "CHFF", "CHTC", "CHTB", "CHTD", "HOK", "MAC"] },
            { "area": "AAOR", "entities": ["AEO", "AET", "JPN", "KOR", "MNG", "PAK", "SINC", "SIN", "SINM", "AEI", "TAI", "VZE"] },
            { "area": "EUCE", "entities": ["ALB", "BLR", "BOS", "BULC", "BUL", "BULT", "CRO", "CZEC", "CZEJ", "CZE", "EEO", "EEC", "GEO", "HUNC", "HUNM", "HUNB", "HUN", "ISR", "KOS", "MKDC", "MKDK", "MKD", "MOLC", "MOL", "MNE", "POLC", "POLX", "POL", "ROMC", "ROM", "ROMP", "ROMV", "RUSC", "RUSN", "RUSZ", "RUSK", "RUSM", "RUSP", "SRB", "SLK", "SLV", "UKRC", "UKRS", "UKR", "UKRY"] },
            { "area": "AFFR", "entities": ["ANG", "BEN", "BUN", "BUR", "CAM", "CEN", "CHA", "CON", "COT", "DRC", "FFO", "FFC", "GAB", "GUN", "FFB", "MAI", "NIG", "SEN", "TOG"] },
            { "area": "LAAM", "entities": ["ARG", "BAR", "BOL", "CHL", "COL", "COS", "BRA", "BRAA", "CUR", "DOR", "ECU", "ELS", "GUE", "GUY", "HAT", "HOD", "JAM", "LAO", "LAC", "MEX", "NIC", "PAN", "PAR", "SUR", "TRI", "TRIF", "URU", "VEN"] },
            { "area": "NAME", "entities": ["EGY", "PAM", "HZD", "HZE", "HZH", "HZI", "HZJ", "HZL", "HZT", "JOR", "LEB", "MEO", "MEC", "OPT"] },
            { "area": "NAOC", "entities": ["AUSC", "AUS", "AUSG", "CAN", "NEZC", "NEZF", "NEZ", "APC", "PIRC", "PIR", "FJI", "PNG", "WSM", "TON", "VUT"] },
            { "area": "PACT", "entities": ["CAC", "PXF", "PXG", "PXJ", "PXM", "PXS", "PXU", "PXYC", "PXY", "PXYY", "PXZC", "PXZ", "PXZZ"] },
            { "area": "AFSE", "entities": ["FEA", "BOT", "ETH", "FEI", "KEN", "LES", "MAD", "MAE", "MAU", "MOZ", "NAM", "RWA", "FEZ", "FEC", "SEY", "SOU", "SSD", "SWA", "SZA", "TAN", "UGA", "ZAM", "ZIM"] },
            { "area": "AASO", "entities": ["BAN", "INDC", "IET", "INE", "INH", "ISE", "ISW", "IND", "ASO", "NEP", "ASC", "SRI"] },
            { "area": "AASE", "entities": ["ACI", "INO", "MAFC", "MAF", "MAFR", "MYA", "PHIC", "PHIF", "PHIG", "PHI", "ACO", "ACC", "THAC", "THAL", "THA", "VZB", "VZC", "VZF"] },
            { "area": "AFWE", "entities": ["EQU", "GAM", "GHA", "GUU", "LIB", "NIR", "NBV", "SIE", "FWA", "FWI", "FWO", "FWC"] },
            { "area": "EUWE", "entities": ["AUTC", "AUT", "AUTG", "CYP", "DNK", "DEN", "EST", "FRAC", "FRA", "FRAO", "GER", "GRE", "IRE", "ITAC", "ITAO", "ITA", "ITAE", "LAT", "LIT", "NETC", "NETG", "NET", "POR", "SPA", "SWE", "SWI", "UNK", "EWO", "EWC"] }
        ];

        theTree = theTree || defTree;
        var fltr = function (e) {
            return e.entities.indexOf(code) > -1;
        };
        var fTree;
        fTree = theTree.filter(fltr);
        var rCode;
        if (fTree.length > 0) {
            rCode = fTree[0].area;
        }
        else {
            if (code === "WHQ")
            {
                rCode = "WHQ";
            }
            else
            {
                rCode = "Unknown";
            }

        }
        return rCode;
    }
    //---------------------------------------------
    function addExportBatchID(batchId, id) {
        var didUpdate = false;
        try {
            //------------------------------------------
            //JT: 10/24/2018 - Alternate method...faster
            record.submitFields({
                type: "advintercompanyjournalentry",
                id: id,
                values: {
                    custbody_ccc_it_batch_export_id: batchId
                },
                options: {
                    ignoreMandatoryFields: true
                }
            });
            didUpdate = true;
        }
        catch (e) {
            var debugMsg;
            debugMsg = "Error: addBatchDetail('" + batchId + "','" + id + "')";
            log.debug(debugMsg, e);
            tebDetailId = 0;
            //utils.catchError("addBatchDetail", e);
            didUpdate = false;
        }
        return didUpdate;
    }
    function getSSFromProd(ssID, useExternal) {
        var url;
        if (useExternal) {
            url = "https://forms.na2.netsuite.com/app/site/hosting/scriptlet.nl?script=635&deploy=1&compid=3540813&h=b0392a3acb3835292b00&cmd={%22cmd%22:%20%22getSS%22,%22ssid%22:%20%22{{searchId}}%22}";
        }
        else {
            url = "/app/site/hosting/scriptlet.nl?script=635&deploy=1&cmd={%22cmd%22:%20%22getSS%22,%22ssid%22:%20%22{{searchId}}%22}";
        }
        url = url.replace("{{searchID}}", ssID);

        log.debug("THE URL", url);
        var res;
        var oRDEF;
        var oRS;
        try {
            res = https.get({
                url: url
            });

            oRDEF = JSON.parse(res);

            oRS = search.create(oRDEF);
        }
        catch (e) {
            log.debug("ERROR", e);
            oRS = res;
        }

        return oRS;


    }
    var aCUR_RATES = [];
    function convertCurrency(nAmount, Cur1, Cur2, d) {
        nAmount = nAmount || 0;
        nAmount = parseFloat(nAmount);
        if (isNaN(nAmount)) {
            nAmount = 0.00;
        }
        if (nAmount == 0.00) {
            return 0.00;
        }

        var rate, rAmt;
        var aTheRate = aCUR_RATES.filter(function (e) { return e.Cur1 == Cur1 && e.Cur2 == Cur2 });
        if (aTheRate.length) {
            rate = aTheRate[0].rate;
        }
        else {
            if (d) {
                d = format.parse({
                    value: d,
                    type: format.Type.DATE
                });
                rate = currency.exchangeRate({
                    source: Cur1,
                    target: Cur2,
                    date: d
                });
            }
            else {
                rate = currency.exchangeRate({
                    source: Cur1,
                    target: Cur2
                });
            }
            aCUR_RATES.push({ "Cur1": Cur1, "Cur2": Cur2, "rate": rate });
        }
        rAmt = currencyConvert(nAmount, rate, Cur2);
        // round({ fxamount } * { linefxrate }, decode({ subsidiary.currency }, 'IDR', 0, 'JPY', 0, 'KRW', 0, 'LAK', 0, 'PYG', 0, 'MGA', 0, 'MMK', 0, 'MRO', 0, 'VND', 0, 'CLP', 0, 'VUV', 0, 2))
        return rAmt;
    }
    function currencyConvert(nAmount, rate, Cur2) {
        var rAmt;
        rAmt = nAmount * rate;
        var precision = 2;
        if (['IDR', 'JPY', 'KRW', 'LAK', 'PYG', 'MGA', 'MMK', 'MRO', 'VND', 'CLP', 'VUV'].indexOf(Cur2) > -1) {
            precision = 0;
        }
        rAmt = parseFloat(rAmt).toFixed(precision);

        // round({ fxamount } * { linefxrate }, decode({ subsidiary.currency }, 'IDR', 0, 'JPY', 0, 'KRW', 0, 'LAK', 0, 'PYG', 0, 'MGA', 0, 'MMK', 0, 'MRO', 0, 'VND', 0, 'CLP', 0, 'VUV', 0, 2))
        return rAmt;
    }
    //-------------------------------------------------------------
    //functions that use gDrive.js
    //-------------------------------------------------------------
    // Don't use Dynamic here...too slow... hard code for now.
    //-------------------------------------------------------------

    function uploadNSFolderToGDrive(cNSPath,lNoSubs) {
        //TODO - upload (recursively) all files in given NS File cabinet path
        var p = platform();
        var cTargetFolderId;
        cTargetFolderId = getPathFolderId(cNSPath);
        //Ensure this folder exist in GDrive
        var cGDrivePathId;
        log.audit("gDriveRoot", cGDriveRoot);
        var cGDrive_Path;
        cGDrive_Path = "NS_FILECAB/" + p.gDrivePath + "/" + cNSPath;
        cGDrivePathId = gDrive.getFolderId(cNSPath,p.gDriveId);
        log.audit("gDrive Path", cGDrive_Path);
        uploadNSFolderIDToGDrive(cTargetFolderId,cGDrivePathId,lNoSubs);
    }
    function uploadNSFolderIDToGDrive(nFolderId,cGDrivePathId,lNoSubs) {
        // Step 1: Copy All Files to GDrive
        // Step 2: Look for Subfolders and upload them to gDrive
        if (lNoSubs) {
            //Don't include Subfolders
        }
        else {
            //Might call an MR script here...

        }

    }
    //-------------------------------------------------------------
    //common runtime stuff
    //--------------------------------------------------------------
    function getJSONParameter(cParameterId) {
        var me = runtime.getCurrentScript();
        var pJSON;

        pJSON = me.getParameter(cParameterId);

        var oParams;
        try {

            oParams = JSONparse(pJSON);
            log.audit("PARAMS", oParams);
        }
        catch (e) {
            log.audit("Cannot Parse Parameter", e);

        }
        return oParams;
    }
    /*
    This version will evaluate properties that begins with 'function(' and
    attempt to convert them to functions. This will allow serialization of
    coded logic/functionality.
     */
    function JSONparse(pJSON){
        oParams = JSON.parse(pJSON);
        //Populate literal function declarations
        for(p in oParams){
            try {
                if (oParams[p].substring(0, 9) === "function(") {
                    oParams[p] = eval(oParams[p]);
                }
            }
            catch(e){}
        }
    }
    return {
        JSONparse : JSONparse,
        googleSheetToArray: googleSheetToArray,
        CSVStringToArray : CSVStringToArray,
        getJSONParameter: getJSONParameter,
        newDeployId: newDeployId,
        createAndSubmitTask: createAndSubmitTask,
        uploadNSFolderToGDrive: uploadNSFolderToGDrive,
        nsFiles : nsFiles,
        gDrive: gDrive,
        search: search,
        record: record,
        runtime : runtime,
        task: task,
        config: config,
        file: file,
        format: format,
        https: https,
        currency: currency,
        convertCurrency: convertCurrency,
        getSSFromProd: getSSFromProd,
        massUpdate : massUpdate,
        addExportBatchID : addExportBatchID,
        getArea: getArea,
        randomString: randomString,
        getCurrencyZEROarray : getCurrencyZEROarray,
        currencyPrecision : currencyPrecision,
        platform : platform,
        isDateInOpenPeriod : isDateInOpenPeriod,
        getEntityTree : getEntityTree,
        getEntityList : getEntityList,
        getsublist : getsublist,
        linkedList : linkedList,
        fileAsString : fileAsString,
        stringToFile : stringToFile,
        saveFile : saveFile,
        getDefaultFolder : getDefaultFolder,
        getPathFolderId : getPathFolderId,
        getFolderId : getFolderId,
        getSubFolders : getSubFolders,
        getFolderTree : getFolderTree,
        runSavedSearch : runSavedSearch,
        searchResultsToArray : searchResultsToArray,
        arrayToCSVString : arrayToCSVString,
        createFolder : createFolder,
        removeFolder : removeFolder,
        runSearch : runSearch,
        arrayToFilterExpression : arrayToFilterExpression,
        arrayToFilterArray : arrayToFilterArray,
        getDeploymentId : getDeploymentId,
        createTransmittalExportBatch : createTransmittalExportBatch,
        getError : getError,
        catchError : catchError,
        version : function(){ return LIB_VERSION;}
    };

}