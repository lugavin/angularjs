/*!
 * https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md
 * https://github.com/johnpapa/ng-demos
 */
(function () {

    'use strict';

    angular
        .module('app.grid.module')
        .filter('StatusFormatter', StatusFormatter)
        .controller('GridCtrl', GridCtrl)
        .controller('GridModalCtrl', GridModalCtrl);

    function StatusFormatter() {
        var map = {'0': '不可用', '1': '可用'};
        return function (input) {
            return map[input] || '';
        };
    }

    function GridCtrl($scope, $uibModal, $http, $log, i18nService, uiGridValidateService, uiGridConstants) {

        $log.debug($scope);

        i18nService.setCurrentLang('zh-cn');

        /**
         * setValidator(name, validatorFactory, messageFunction)
         */
        uiGridValidateService.setValidator('minValue', function (argument) {
                return function (oldValue, newValue, rowEntity, colDef) {
                    return newValue >= argument;
                };
            }, function (argument) {
                return '你输入的值不能小于"' + argument + '"';
            }
        );

        var data = [
            {id: 1001, name: 'iPad', status: '1', quantity: 5, price: 500, subcost: 2500},
            {id: 1002, name: 'iPhone', status: '1', quantity: 5, price: 1000, subcost: 5000},
            {id: 1003, name: 'iMac', status: '1', quantity: 5, price: 2000, subcost: 10000}
        ];

        var vm = this;

        vm.add = add;
        vm.edit = edit;
        vm.view = view;
        vm.remove = remove;
        vm.refresh = refresh;
        vm.editRow = editRow;
        vm.removeRow = removeRow;
        vm.viewRow = viewRow;

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
            // rowTemplate: '<div ng-dblclick="grid.appScope.ondblclick(grid, row)" ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{\'ui-grid-row-header-cell\': col.isRowHeader}" ui-grid-cell></div>',
            // appScopeProvider: {
            //     ondblclick: function (grid, row) {
            //         console.info(row.entity);
            //     }
            // },
            enableCellEdit: false,
            cellEditableCondition: function () {
                return true;
            },
            onRegisterApi: function (gridApi) {
                vm.gridApi = gridApi;
                gridApi.pagination.on.paginationChanged($scope, function (pageNumber, pageSize) {
                    $log.info(pageNumber, pageSize);
                });
                gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    $log.info(row);
                });
                gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                    if (newValue != oldValue) {
                        rowEntity.subcost = (rowEntity.quantity || 0) * (rowEntity.price || 0);
                    }
                });
                gridApi.validate.on.validationFailed($scope, function (rowEntity, colDef, newValue, oldValue) {
                    $log.info(rowEntity, colDef, newValue, oldValue);
                });
            },
            columnDefs: [
                {
                    field: 'id',
                    displayName: '商品编号',
                    visible: true
                },
                {
                    field: 'name',
                    displayName: '商品名称'
                },
                {
                    field: 'status',
                    displayName: '状态',
                    visible: false,
                    cellFilter: 'StatusFormatter'
                },
                {
                    field: 'quantity',
                    displayName: '购买数量',
                    type: 'number',
                    cellClass: 'text-left',
                    enableCellEdit: true,
                    cellEditableCondition: function ($scope) {
                        return $scope.row.entity.isNew;
                    },
                    validators: {required: true, minValue: 1},
                    cellTemplate: 'ui-grid/cellTitleValidator',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    aggregationLabel: '购买总数量：'
                },
                {
                    field: 'price',
                    displayName: '商品单价',
                    cellClass: 'text-left'
                },
                {
                    field: 'subcost',
                    displayName: '小计',
                    cellClass: 'text-left',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    aggregationLabel: '购买总价：'
                },
                {
                    field: 'action',
                    displayName: '操作',
                    cellTemplate: 'template'
                }
            ]
        };

        vm.gridOptions.data = data;

        function add() {
            var row = {id: 1004, name: 'iMac', status: '0', quantity: 5, price: 2000, subcost: 10000, isNew: true};
            vm.gridOptions.data.push(row);
        }

        function edit() {
            var row = vm.gridApi.selection.getSelectedRows()[0];
            // row.name = row.name + '_';
            // var rowData = angular.copy(row);
            // rowData.name = rowData.name + '_';
            // angular.extend(row, rowData);
            // angular.extend({}, row, rowData);
            row && openModal(row, {parentCtrl: vm, action: 'edit', disabled: false});
        }

        function remove() {
            var row = vm.gridApi.selection.getSelectedRows()[0];
            row && vm.gridOptions.data.splice(vm.gridOptions.data.indexOf(row), 1);
        }

        function view() {
            var row = vm.gridApi.selection.getSelectedRows()[0];
            row && openModal(row, {parentCtrl: vm, action: 'view', disabled: true});
        }

        function editRow(grid, row) {
            openModal(row.entity, {parentCtrl: vm, action: 'edit', disabled: false});
        }

        function removeRow(grid, row) {
            var index = vm.gridOptions.data.indexOf(row.entity);
            vm.gridOptions.data.splice(index, 1);
        }

        function viewRow(grid, row) {
            openModal(row.entity, {parentCtrl: vm, action: 'view', disabled: true});
        }

        function refresh() {
            $log.info('Refresh DataGrid...');
        }

        function openModal(row, param) {
            $uibModal.open({
                templateUrl: 'edit.html',
                controller: 'GridModalCtrl',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'lg',
                resolve: {
                    items: function () {
                        return angular.extend({rowData: angular.copy(row)}, param);
                    }
                }
            });
        }

    }

    function GridModalCtrl($uibModalInstance, $log, items) {

        var vm = this;

        vm.save = save;
        vm.close = close;

        vm.item = items.rowData;
        vm.parentCtrl = items.parentCtrl;
        vm.action = items.action;
        vm.disabled = items.disabled;

        function save() {
            $uibModalInstance.close(true);
            vm.parentCtrl.refresh();
        }

        function close() {
            $uibModalInstance.dismiss(0);
        }

    }

})();