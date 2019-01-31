/**
 * KLS_CCC_Library.js
 *
 * author : kyra schaefer
 *
 * @NApiVersion 2.x
 * @NModuleScope Public
 */

define([ 'N/record', 'N/search' ],
    /**
     * @param {record}
     *            record
     * @param {search}
     *            search
     */
    function(record, search) {

        /*
         * Gets the Local Designation based on the US Designation and/or Global
         * Designation. Gets the Responsibility Center from the Local Designation.
         */
        function getLocalDesignation(transmittalId, designationUS,
                                     designationGlobal) {
            var dbug = { tid:  transmittalId, USDesig: designationUS , Global: designationGlobal};

            log.debug("GetLocalDesig Call",dbug);

            var item = '';
            if (designationUS) {
                //JT: 10/1/2018 --- Change search to look for us designation equal to instead of is
                // "is" operator returning 150+ results...

                var itemSearch = search.create({
                    type : "item",
                    filters : [
                        [ "custitem_ccc_usdesignationnumber", search.Operator.IS,
                            designationUS ], "AND",
                        [ "isinactive", search.Operator.IS, "F" ], "AND",
                        [ "custitem_ccc_global_designation", search.Operator.IS, "T"] ],
                    columns : [ "internalid" ]
                });
                log.debug("Inside US Desig Search","after search created")
                itemSearch.run().each(function(result) {
                    item = result.getValue('internalid');
                    log.debug("inside USdesig search results","item: " + item);
                    record.submitFields({
                        type : 'customrecord_ccc_it_transmittal',
                        id : transmittalId,
                        values : {
                            custrecord_ccci_it_global_desig : item
                        }
                    });
                    return true;
                });
            }
            //JT 9/20/2018 - was else {
            if(item=="")
            {
                if (designationGlobal)
                {
                    // US Designation = no and Global Designation = yes
                    item = designationGlobal;
                }
            }

            if (item != '') {
                // Find Parent (Local) Designation
                var parentLookup = search.lookupFields({
                    type : search.Type.ITEM,
                    id : item,
                    columns : [ 'parent', 'parent.department' ]
                });
                var designationParent = parentLookup.parent[0].value;
                log.debug('International Donation', 'Parent Object: '
                    + JSON.stringify(parentLookup));
                var departmentParent = parentLookup["parent.department"][0].value;

                if (designationParent) {
                    // Local Design in Dest Entity found
                    item = designationParent;
                    record.submitFields({
                        type : 'customrecord_ccc_it_transmittal',
                        id : transmittalId,
                        values : {
                            custrecord_ccci_it_local_desig : item,
                            custrecord_ccc_it_local_resp_cntr : departmentParent
                        }
                    });
                    return [ item, departmentParent, false, null ];
                } else {
                    // No Local Desig in Dest Entity found - Log Error
                    return [ null, null, true,
                        'No Local Desig in Dest Entity found' ];
                }
            } else {
                // No Global Designation - Log Error
                return [ null, null, true, 'No Global Designation found' ];
            }
        }

        return {
            getLocalDesignation : getLocalDesignation
        };

    });