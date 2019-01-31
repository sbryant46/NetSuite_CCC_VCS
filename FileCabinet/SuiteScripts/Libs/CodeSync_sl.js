/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['/SuiteScripts/Libs/restFunctions'],
    /**
     * @param {file} file
     * @param {format} format
     * @param {http} http
     * @param {https} https
     * @param {runtime} runtime
     * @param {search} search
     */
    function (restFns) {
        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */
        function onRequest(context) {
            restFns.onRequest(context);
        }

        return {
            onRequest: onRequest
        };
    });