/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 *
 * CodeSync_rl.js
 * This will receive a file and update a file in the file cabinet/script
 *  Use this to Sync Code (js files) on SB1, SB2, SB3, SB4, and PROD.
 *
 *
 CONSUMER KEY
 b1f8fa2817b552c0d1b4fac00d9a6e6b843fad22763060ae22d0454d17aae54c
 CONSUMER SECRET
 cf705f3847f58cd2508787c3e4e32eacda4017f6690c776f9439af4da0227207
 */
define(['N/file', 'N/record', '/SuiteScripts/Libs/ccc_utilities'],
    /**
     * @param {file} file
     * @param {record} record
     */
    function (file, record, utils) {
        function getTheParameter(ctx, m) {
            m = m || 'get';
            var theParam = {};
            try {
                theParam = JSON.parse(ctx.param);
            }
            catch (e) {
                theParam = {};
            }
            theParam = validateParameter(theParam, m);
            return theParam;
        }
        function validateParameter(oParam, method) {
            method = method || "get";
            var rP = JSON.parse(JSON.stringify(oParam));
            switch (method) {
                case "get":
                    rP.cmdType = rP.cmtType || "savedSearch";
                    rP.ssid = rP.ssid || "customsearch_ccc_it_to_process";
                    break;
                default:
                    break;
            }
            return rP;

        }
        /**
         * Function called upon sending a GET request to the RESTlet.
         *
         * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
         * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
         * @since 2015.1
         */
        function doGet(requestParams) {
            var oParams;
            oParams = getTheParameter(requestParams);
            //For Testing only support savedSearch data return..
            var oRet;
            oRet = utils.runSavedSearch(oParams.ssid);

            return JSON.stringify(oRet);


        }

        /**
         * Function called upon sending a PUT request to the RESTlet.
         *
         * @param {string | Object} requestBody - The HTTP request body; request body will be passed into function as a string when request Content-Type is 'text/plain'
         * or parsed into an Object when request Content-Type is 'application/json' (in which case the body must be a valid JSON)
         * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
         * @since 2015.2
         */
        function doPut(requestBody) {

        }


        /**
         * Function called upon sending a POST request to the RESTlet.
         *
         * @param {string | Object} requestBody - The HTTP request body; request body will be passed into function as a string when request Content-Type is 'text/plain'
         * or parsed into an Object when request Content-Type is 'application/json' (in which case the body must be a valid JSON)
         * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
         * @since 2015.2
         */
        function doPost(requestBody) {

        }

        /**
         * Function called upon sending a DELETE request to the RESTlet.
         *
         * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
         * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
         * @since 2015.2
         */
        function doDelete(requestParams) {

        }

        return {
            'get': doGet,
            put: doPut,
            post: doPost,
            'delete': doDelete
        };

    });