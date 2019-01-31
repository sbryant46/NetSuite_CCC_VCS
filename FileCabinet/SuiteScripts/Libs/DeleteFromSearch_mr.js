/**
 * @NApiVersion 2.0
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 * Dependencies:
 * This scrip;t is initiated by a regularly scheduled script with correct paramters
 *   for scope based on frequency
 * NOT GENERIC...record type of cashsale only...special for nick.
 * ID:      NA
 * DID:     NA
 * PARAM:   custscript_ccc_delete_from_searchP1
 *  Param is JSON.. { ssid: 'the id of the search'}
 */

define(['N/email', 'N/cache', 'N/config', 'N/task', 'N/runtime', '/SuiteScripts/Libs/ccc_utilities', '/SuiteScripts/Libs/gDrive', 'N/file', 'N/search', 'N/record'], fnEntry);
function fnEntry(emailModule, cache, config, task, runtime, utils, gDrive, file, search, record) {
    var isDeleting = true;

    /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     *
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     *
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1
     */
    function getInputData() {
        var defSSID = "customsearch_whq_trans_nez_nezf"; // "customsearch_ccc_test_del";
        var me, pJSON, oParams, aReturnData, oSS, typeId;
        oParams = {};
        try {
            me = runtime.getCurrentScript();

            pJSON = me.getParameter("custscript_ccc_delete_from_searchP1");
            log.debug("pJSON", pJSON);
            oParams = JSON.parse(pJSON);
            log.debug("PARAMS", oParams);
            if (!oParams) {
                oParams = { ssid: defSSID };
            }
        }
        catch (ee) {
            oParams = { ssid: defSSID };
        }
        log.debug("FINAL PARAMS", oParams);
        aReturnData = [];
        //oParams.ssid = oParams.ssid || defSSI;
        try {
            oSS = search.load({ id: oParams.ssid });
        }
        catch (e) {
            oSS = null;
        }
        if (oSS != null) {

            typeId = oSS.searchType;

            aReturnData = utils.runSavedSearch(oParams.ssid);
            aReturnData = utils.searchResultsToArray(aReturnData);
            aReturnData = aReturnData.map(function (e) {
                var r = {};
                r.id = e.internalid;
                r.rtype = typeId;
                return r;
            });
        }
        else {
            log.debug("Invalid SS");
        }
        log.debug("LIST COUNT: " + aReturnData.length);
        return aReturnData;
    }
    //--------------------------------------------------
    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
        var oRow = JSON.parse(context.value);
        //log.debug(oRow);
        var entity;
        //entity =oRow["CUSTBODY_CCC_SRC_TRANSMITTAL_REC.custrecord_ccc_it_src_entity_cd"];// "TheData";// oRow.values["CUSTBODY_CCC_SRC_TRANSMITTAL_REC.custrecord_ccc_it_src_entity_cd"].text;
        //entity = oRow["id"];


        context.write({
            key: oRow.id,
            value: JSON.stringify(oRow.rtype)
        });

    }
    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     *
     * JT: 10/10/2018 Produce 2 files... one with Donor Information (CRM) and one with GL Transactions!!
     */
    function reduce(context) {
        //log.debug("KEY: " + context.key + " : Count: ", context.values.length);

        //parentId = gDrive.getTeamDrive(tdName); //
        var aRows, theID, theType;
        theID = context.key;
        try {
            aRows = context.values.map(function (e) {
                return JSON.parse(e);
            });
            //log.debug(aRows[0]);
            theType = aRows[0];

        }
        catch (ee) {
            theType = "cashsale";
        }

        //theType = "transaction";
        theType = "cashsale";
        try {
            if (isDeleting) {
                record.delete({
                    type: theType,
                    id: theID
                });
                log.debug("DELETED : " + theID);
            }
            else {
                record.load({
                    type: theType,
                    id: theID
                });
                log.debug("Loaded : " + theID);
            }
        }
        catch (er) {
            log.error("Failed: "+theType+":"+theID, er);
        }
    }
    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) {
        //log.audit('Number of queues', summary.concurrency);
        //log.audit('Input Error', summary.inputSummary);

        summary.mapSummary.errors.iterator().each(function (key, error) {
            log.error('Map Error for key: ' + key, error);
            return true;
        });

        summary.reduceSummary.errors.iterator().each(function (key, error) {
            log.error('Reduce Error for key: ' + key, error);
            return true;
        });
    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };

};