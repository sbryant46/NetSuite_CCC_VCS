/**
 * @NApiVersion 2.0
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 * Dependencies:
 * This script is initiated by a call to ccc_utilities.massUpdate()
 *
 *
 * ID:      customscript_ccc_mr_mass_update
 * DID:     customdeploy_ccc_mr_mass_update
 * PARAM:   custscript_ccc_mr_mass_update_p1
 *
 * 		SuiteScripts/Libs/ccc_utilities.js
 * 		SuiteScripts/Libs/gDirve.js
 *
 */
define(['N/email', 'N/cache', 'N/config', 'N/task', 'N/runtime', '/SuiteScripts/Libs/ccc_utilities'], fnEntry);
function fnEntry(emailModule, cache, config, task, runtime, utils) {
    function getScriptParameter() {
        var me = runtime.getCurrentScript();
        var pJSON;
        pJSON = me.getParameter("custscript_ccc_mr_mass_update_p1");
        /*
         * Expected Parameter Object
         * {
         *     ssid: 'id of your search',
         *     recordType: '',
         *     values: {
         *                 custbody_ccc_it_batch_export_id : 'newvalue'
         *              }
         *  }
         *
         * */

        var oParams;
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
        return oParams;
    }
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
        var oParams;
        oParams = utils.getJSONParameter("custscript_ccc_mr_mass_update_p1");
        var ssID = oParams.ssid;
        var theSearch = oParams.theSearch;
        var rType = oParams.recordType;
        var values = oParams.values;
        var oD;
        if(theSearch){
            theSearch = utils.search.create(theSearch);
            oD.utils.runSavedSearch(theSearch);
        }
        else {
            oD = utils.runSavedSearch(ssID, null, null, true);
        }
        oD = oD.map(function (e) { return e.ID; });
        oD = oD.filter(function (v, i, s) { return s.indexOf(v) === i; });
        oD = oD.map(function (e) {
            var r = {};
            r.theKEY = e;
            r.rType = rType;
            return r;
        });

        return oD;

    }
    //-------------------------------------------------
    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
        var oParams;
        oParams = utils.getJSONParameter("custscript_ccc_mr_mass_update_p1");
        //log.debug("Map JSON",context.value);
        var oRow = JSON.parse(context.value);
        var rType = oParams.recordType;
        var values = oParams.values;
        var theId = oRow["theKEY"];

        //entity =oRow["CUSTBODY_CCC_SRC_TRANSMITTAL_REC.custrecord_ccc_it_src_entity_cd"];// "TheData";// oRow.values["CUSTBODY_CCC_SRC_TRANSMITTAL_REC.custrecord_ccc_it_src_entity_cd"].text;
        try {
            record.submitFields({
                type: rType,
                id: theId,
                values: values,
                options: {
                    ignoreMandatoryFields: true
                }
            });
        }
        catch(e){
            log.error("submitFields",e);
        }


    }

    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     *
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
        summarize: summarize
    };

};