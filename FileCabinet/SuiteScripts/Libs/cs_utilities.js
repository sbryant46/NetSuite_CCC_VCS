/**
 * cs_utilities.js
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([ 'N/error', 'N/record', 'N/runtime', 'N/search', 'N/https','N/url'],
    function (error,record,runtime,search,https,url) {
        var u = {};
        u.version = "1.0.0";
        //-------------------------------------------
        // Hook in ...,
        //-------------------------------------------
        u.checkForDateInOpenPeriod = function(scriptContext){
            var oRet = {};
            oRet.status = "OK";
            oRet.msg = "";
            try {
                //Define all fields that need this validation
                var fieldIDs = ['custrecord_ccc_it_date'];
                var idx = fieldIDs.indexOf(scriptContext.fieldId);
                if(idx==-1)
                {
                    // Bail out.. not a target field
                    return oRet;
                }
                var thisRecord = scriptContext.currentRecord;
                var isGood = 0;
                var theDate = thisRecord.getText(scriptContext.fieldId);
                isGood = this.isDateInOpenPeriod(theDate);
                if(!isGood){
                    oRet.status = "FAIL";
                    oRet.msg = "Date not in open period.";
                    thisRecord.setValue({
                        fieldId: scriptContext.fieldId,
                        value : '',
                        ignoreFieldChange : true
                    });
                    alert("Please enter a date in an open period.");
                }
            } catch(e1){
                oRet.status = "OK";
                oRet.msg = "Error in period date check."
            }
            return oRet;

        }
        u.isDateInOpenPeriod = function(stDate){
            var stSearchId =  'customsearch_ccc_accounting_open_period';
            var stLookupScript = 'customscript_ccc_utilities_rl' ;
            var stLookupDeploy ='customdeploy_ccc_utils_rl' ;

            var objParams = {
                cmd : "utils.isDateInOpenPeriod('"+ stDate + "')"
            }

            var urlSuitelet = url.resolveScript({
                scriptId : stLookupScript,
                deploymentId : stLookupDeploy,
                returnExternalUrl : false,
                params : objParams
            });
            var objResponse;
            var rError;
            try {
                objResponse = https.request({
                    method : https.Method.GET,
                    url : urlSuitelet,
                    headers : { 'Content-Type': 'application/json'}
                });
            }
            catch(ee){
                rError = ee;
            }
            //Content-Type = application/json
            var ret,lRet;
            ret = (objResponse.code == '200') ? JSON.parse(objResponse.body) : null;
            if(ret){
                if(typeof ret == "string"){
                    ret = JSON.parse(ret);
                } else {

                }
            } else {
                ret = {};
                ret.result = null;
                ret.msg = "Call error: "+objResponse.code;
                ret.error = "ERRROR";
            }
            if(ret.msg=="OK"){
                lRet = ret.result;
            } else {
                lRet = false;
            }
            return lRet;
        }
        return {
            csCode : u
        };

    });