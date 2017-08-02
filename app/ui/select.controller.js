/*!
 * https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md
 */
(function () {

    'use strict';

    angular
        .module('app.select.module')
        //.directive('uiSelectWrap', uiSelectWrap)
        .controller('SelectCtrl', SelectCtrl)
        .filter('propsFilter', propsFilter);

    function uiSelectWrap($document, uiGridEditConstants) {
        return {
            link: function ($scope, $element, $attr) {
                $document.on('click', onClick);
                function onClick(evt) {
                    console.info($element);
                    console.info($attr);
                    if (!angular.element(evt.target).closest('.ui-select-container')) {
                        $scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
                        $document.off('click', onClick);
                    }
                }
            }
        };
    }

    function SelectCtrl($scope, $uibModal, $http, $log, i18nService, uiGridConstants) {

        i18nService.setCurrentLang('zh-cn');

        var data = [
            {id: 1001, name: 'iPad', status: '1', quantity: 5, price: 500, subcost: 2500},
            {id: 1002, name: 'iPhone', status: '1', quantity: 5, price: 1000, subcost: 5000},
            {id: 1003, name: 'iMac', status: '1', quantity: 5, price: 2000, subcost: 10000}
        ];

        var items = [
            {uid: '101', name: 'ann', email: 'ann@gmail.com'},
            {uid: '102', name: 'alan', email: 'alan@gmail.com'},
            {uid: '103', name: 'panxt', email: 'panxt@gmail.com'},
            {uid: '104', name: 'gavin', email: 'gavin@gmail.com'},
            {uid: '105', name: 'lugavin', email: 'lugavin@gmail.com'}
        ];

        var dropdownOptions = [
            {id: '101', value: '满100减50'},
            {id: '102', value: '满200减120'},
            {id: '103', value: '满300减180'},
            {id: '104', value: '满400减250'},
            {id: '105', value: '满500减300'}
        ];

        var vm = this;

        vm.items = items;
        vm.dropdownOptions = dropdownOptions;

        vm.onSelected = function ($item, $model, grid, row) {
            row.entity.cid = $item.id;
            row.entity.cname = $item.value;
        };

        /**
         * https://github.com/angular-ui/ui-grid/wiki/Configuration-Options
         * https://github.com/angular-ui/ui-grid/wiki/Defining-columns
         */
        vm.gridOptions = {
            enableCellEditOnFocus: true,
            enableHorizontalScrollbar: false,
            enableVerticalScrollbar: true,
            enableRowSelection: true,
            multiSelect: false,
            enableSorting: true,
            enablePagination: true,
            enablePaginationControls: true,
            paginationPageSizes: [10, 20, 50, 100],
            paginationPageSize: 10,
            paginationCurrentPage: 1,
            totalItems: 0,
            useExternalPagination: true,
            enableFiltering: false,
            showColumnFooter: true,
            showGridFooter: false,
            onRegisterApi: function (gridApi) {
                vm.gridApi = gridApi;
                gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                    if (newValue != oldValue) {
                        rowEntity.subcost = (rowEntity.quantity || 0) * (rowEntity.price || 0);
                    }
                });
            },
            columnDefs: [
                {
                    field: 'id',
                    displayName: '商品编号',
                    enableCellEdit: false,
                    visible: true,
                    enableColumnMenu: false
                },
                {
                    field: 'name',
                    displayName: '商品名称',
                    enableCellEdit: false,
                    enableColumnMenu: false
                },
                {
                    field: 'cid',
                    visible: false
                },
                {
                    field: 'cname',
                    visible: false
                },
                {
                    field: 'coupon',
                    displayName: '优惠券',
                    // editableCellTemplate: 'ui-grid/dropdownEditor',
                    // editDropdownOptionsArray: dropdownOptions,
                    // editDropdownIdLabel: 'cid',
                    // editDropdownValueLabel: 'cname',
                    // cellFilter: 'griddropdown:this',
                    editableCellTemplate: 'template.html'

                },
                {
                    field: 'quantity',
                    displayName: '购买数量',
                    type: 'number',
                    cellClass: 'text-left',
                    enableCellEdit: true,
                    enableColumnMenu: false,
                    validators: {required: true, minValue: 1},
                    cellTemplate: 'ui-grid/cellTitleValidator',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    aggregationLabel: '购买总数量：'
                },
                {
                    field: 'price',
                    displayName: '商品单价',
                    cellClass: 'text-left',
                    enableCellEdit: false,
                    enableColumnMenu: false
                },
                {
                    field: 'subcost',
                    displayName: '小计',
                    cellClass: 'text-left',
                    enableCellEdit: false,
                    enableColumnMenu: false,
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    aggregationLabel: '购买总价：'
                }
            ]
        };

        vm.gridOptions.data = data;

    }

    function propsFilter() {
        return function (items, props) {
            var out = [];
            if (angular.isArray(items)) {
                var keys = Object.keys(props);
                items.forEach(function (item) {
                    var itemMatches = false;
                    for (var i = 0; i < keys.length; i++) {
                        var prop = keys[i];
                        var text = props[prop].toLowerCase();
                        if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                            itemMatches = true;
                            break;
                        }
                    }
                    if (itemMatches) {
                        out.push(item);
                    }
                });
            } else {
                out = items;
            }
            return out;
        };
    }

    // function griddropdown() {
    //     return function (input, context) {
    //         try {
    //             var map = context.col.colDef.editDropdownOptionsArray;
    //             var idField = context.col.colDef.editDropdownIdLabel;
    //             var valueField = context.col.colDef.editDropdownValueLabel;
    //             var initial = context.row.entity[context.col.field];
    //             if (typeof map !== "undefined") {
    //                 for (var i = 0; i < map.length; i++) {
    //                     if (map[i][idField] == input) {
    //                         return map[i][valueField];
    //                     }
    //                 }
    //             } else if (initial) {
    //                 return initial;
    //             }
    //             return input;
    //         } catch (e) {
    //             context.grid.appScope.vm.log("Error: " + e);
    //         }
    //     }
    // }

})();