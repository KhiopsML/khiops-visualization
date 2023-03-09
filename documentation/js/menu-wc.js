'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">visualization-component documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-toggle="collapse" ${ isNormalMode ?
                                'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AppModule-2eb852950407b747e745c6129fb8526ba540129286e1a7d7b8fd03ae054e66e16dc96b71253aa7a48d0db43d137908982b84904a972c09c03e46401a5eb8cd53"' : 'data-target="#xs-components-links-module-AppModule-2eb852950407b747e745c6129fb8526ba540129286e1a7d7b8fd03ae054e66e16dc96b71253aa7a48d0db43d137908982b84904a972c09c03e46401a5eb8cd53"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-2eb852950407b747e745c6129fb8526ba540129286e1a7d7b8fd03ae054e66e16dc96b71253aa7a48d0db43d137908982b84904a972c09c03e46401a5eb8cd53"' :
                                            'id="xs-components-links-module-AppModule-2eb852950407b747e745c6129fb8526ba540129286e1a7d7b8fd03ae054e66e16dc96b71253aa7a48d0db43d137908982b84904a972c09c03e46401a5eb8cd53"' }>
                                            <li class="link">
                                                <a href="components/AppComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/KhiopsCovisualizationModule.html" data-type="entity-link" >KhiopsCovisualizationModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-KhiopsCovisualizationModule-47ee8acdc7a6e636c555f36298c45462a6a7faa8f896a42a7468802338b21575f8c59ea6d6a5ae264717d934dfa7e738577838106f4a2b5cafaf0e91aa574718"' : 'data-target="#xs-components-links-module-KhiopsCovisualizationModule-47ee8acdc7a6e636c555f36298c45462a6a7faa8f896a42a7468802338b21575f8c59ea6d6a5ae264717d934dfa7e738577838106f4a2b5cafaf0e91aa574718"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-KhiopsCovisualizationModule-47ee8acdc7a6e636c555f36298c45462a6a7faa8f896a42a7468802338b21575f8c59ea6d6a5ae264717d934dfa7e738577838106f4a2b5cafaf0e91aa574718"' :
                                            'id="xs-components-links-module-KhiopsCovisualizationModule-47ee8acdc7a6e636c555f36298c45462a6a7faa8f896a42a7468802338b21575f8c59ea6d6a5ae264717d934dfa7e738577838106f4a2b5cafaf0e91aa574718"' }>
                                            <li class="link">
                                                <a href="components/AnnotationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnnotationComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AppComponent-1.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AppComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AxisComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AxisComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AxisViewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AxisViewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ClusterDetailsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ClusterDetailsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CompositionComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CompositionComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ExternalDatasComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ExternalDatasComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/HeaderManageViewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HeaderManageViewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/HierarchySelectComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HierarchySelectComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/HomeLayoutComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HomeLayoutComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ImportExtDatasComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ImportExtDatasComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ImportExtDatasListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ImportExtDatasListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LoadExtDatasComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LoadExtDatasComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ManageViewsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ManageViewsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MatrixContainerComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MatrixContainerComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProjectViewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProjectViewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SelectedClustersComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SelectedClustersComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TreeSelectComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TreeSelectComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UnfoldHierarchyComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UnfoldHierarchyComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UserSettingsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserSettingsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/VariableGraphDetailsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >VariableGraphDetailsComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-KhiopsCovisualizationModule-47ee8acdc7a6e636c555f36298c45462a6a7faa8f896a42a7468802338b21575f8c59ea6d6a5ae264717d934dfa7e738577838106f4a2b5cafaf0e91aa574718"' : 'data-target="#xs-injectables-links-module-KhiopsCovisualizationModule-47ee8acdc7a6e636c555f36298c45462a6a7faa8f896a42a7468802338b21575f8c59ea6d6a5ae264717d934dfa7e738577838106f4a2b5cafaf0e91aa574718"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-KhiopsCovisualizationModule-47ee8acdc7a6e636c555f36298c45462a6a7faa8f896a42a7468802338b21575f8c59ea6d6a5ae264717d934dfa7e738577838106f4a2b5cafaf0e91aa574718"' :
                                        'id="xs-injectables-links-module-KhiopsCovisualizationModule-47ee8acdc7a6e636c555f36298c45462a6a7faa8f896a42a7468802338b21575f8c59ea6d6a5ae264717d934dfa7e738577838106f4a2b5cafaf0e91aa574718"' }>
                                        <li class="link">
                                            <a href="injectables/ElectronService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ElectronService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/KhiopsLibraryModule.html" data-type="entity-link" >KhiopsLibraryModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-KhiopsLibraryModule-5b548942cf195efe219c2374cd9c40c602924c18b730bfd70c3782bc12722beb06902648edcc9f891b302f98f7a9f877982c883fe5a01347b89d7d5d3e2d2cbb"' : 'data-target="#xs-components-links-module-KhiopsLibraryModule-5b548942cf195efe219c2374cd9c40c602924c18b730bfd70c3782bc12722beb06902648edcc9f891b302f98f7a9f877982c883fe5a01347b89d7d5d3e2d2cbb"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-KhiopsLibraryModule-5b548942cf195efe219c2374cd9c40c602924c18b730bfd70c3782bc12722beb06902648edcc9f891b302f98f7a9f877982c883fe5a01347b89d7d5d3e2d2cbb"' :
                                            'id="xs-components-links-module-KhiopsLibraryModule-5b548942cf195efe219c2374cd9c40c602924c18b730bfd70c3782bc12722beb06902648edcc9f891b302f98f7a9f877982c883fe5a01347b89d7d5d3e2d2cbb"' }>
                                            <li class="link">
                                                <a href="components/AgGridComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AgGridComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AppVersionComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppVersionComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/BtnFullscreenComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BtnFullscreenComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CellStatsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CellStatsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ChartNextComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ChartNextComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CheckboxCellComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CheckboxCellComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ConfirmDialogComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ConfirmDialogComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DistributionGraphCanvasComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DistributionGraphCanvasComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FileLoaderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FileLoaderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/GraphHeaderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GraphHeaderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/HeaderTitleComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HeaderTitleComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/HeaderToolsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HeaderToolsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/IconCellComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >IconCellComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ImportFileLoaderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ImportFileLoaderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/InformationsBlockComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >InformationsBlockComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LegendComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LegendComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LibVersionComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LibVersionComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MatrixCanvasComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MatrixCanvasComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MatrixTooltipComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MatrixTooltipComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/NoDataComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NoDataComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReleaseButtonComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReleaseButtonComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReleaseNotesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReleaseNotesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ScrollableGraphCanvasComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ScrollableGraphCanvasComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SelectableComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SelectableComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SelectableTabComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SelectableTabComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/WatchResizeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >WatchResizeComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#pipes-links-module-KhiopsLibraryModule-5b548942cf195efe219c2374cd9c40c602924c18b730bfd70c3782bc12722beb06902648edcc9f891b302f98f7a9f877982c883fe5a01347b89d7d5d3e2d2cbb"' : 'data-target="#xs-pipes-links-module-KhiopsLibraryModule-5b548942cf195efe219c2374cd9c40c602924c18b730bfd70c3782bc12722beb06902648edcc9f891b302f98f7a9f877982c883fe5a01347b89d7d5d3e2d2cbb"' }>
                                            <span class="icon ion-md-add"></span>
                                            <span>Pipes</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="pipes-links-module-KhiopsLibraryModule-5b548942cf195efe219c2374cd9c40c602924c18b730bfd70c3782bc12722beb06902648edcc9f891b302f98f7a9f877982c883fe5a01347b89d7d5d3e2d2cbb"' :
                                            'id="xs-pipes-links-module-KhiopsLibraryModule-5b548942cf195efe219c2374cd9c40c602924c18b730bfd70c3782bc12722beb06902648edcc9f891b302f98f7a9f877982c883fe5a01347b89d7d5d3e2d2cbb"' }>
                                            <li class="link">
                                                <a href="pipes/RowIdentifierPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RowIdentifierPipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/ToPrecisionPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ToPrecisionPipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/TranslatePipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TranslatePipe</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/KhiopsVisualizationModule.html" data-type="entity-link" >KhiopsVisualizationModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-KhiopsVisualizationModule-c252b312dc97a3802bf866767c32312fa4c4d3c6992424adfa21db2f262753777aabd1807485746f63d39321180ca6c81fc5944824cfca6d583bfa7cdc593925"' : 'data-target="#xs-components-links-module-KhiopsVisualizationModule-c252b312dc97a3802bf866767c32312fa4c4d3c6992424adfa21db2f262753777aabd1807485746f63d39321180ca6c81fc5944824cfca6d583bfa7cdc593925"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-KhiopsVisualizationModule-c252b312dc97a3802bf866767c32312fa4c4d3c6992424adfa21db2f262753777aabd1807485746f63d39321180ca6c81fc5944824cfca6d583bfa7cdc593925"' :
                                            'id="xs-components-links-module-KhiopsVisualizationModule-c252b312dc97a3802bf866767c32312fa4c4d3c6992424adfa21db2f262753777aabd1807485746f63d39321180ca6c81fc5944824cfca6d583bfa7cdc593925"' }>
                                            <li class="link">
                                                <a href="components/AppComponent-2.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AppComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CoocurenceMatrixComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CoocurenceMatrixComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DescriptionBlockComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DescriptionBlockComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EvaluationViewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EvaluationViewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LevelDistributionGraphCanvasComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LevelDistributionGraphCanvasComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ModelingViewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ModelingViewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/Preparation2dViewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >Preparation2dViewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PreparationViewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PreparationViewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RegressionMatrixComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RegressionMatrixComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SelectToggleButtonComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SelectToggleButtonComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SelectTrainedPredictorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SelectTrainedPredictorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TargetDistributionGraphCanvasComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TargetDistributionGraphCanvasComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TargetLiftGraphComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TargetLiftGraphComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TargetVariableStatsCanvasComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TargetVariableStatsCanvasComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TreeDetailsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TreeDetailsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TreeHyperComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TreeHyperComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TreeLeafDetailsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TreeLeafDetailsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TreePreparationViewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TreePreparationViewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/VarDetailsPreparation2dComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >VarDetailsPreparation2dComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/VarDetailsPreparationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >VarDetailsPreparationComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/VarDetailsTreePreparationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >VarDetailsTreePreparationComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-KhiopsVisualizationModule-c252b312dc97a3802bf866767c32312fa4c4d3c6992424adfa21db2f262753777aabd1807485746f63d39321180ca6c81fc5944824cfca6d583bfa7cdc593925"' : 'data-target="#xs-injectables-links-module-KhiopsVisualizationModule-c252b312dc97a3802bf866767c32312fa4c4d3c6992424adfa21db2f262753777aabd1807485746f63d39321180ca6c81fc5944824cfca6d583bfa7cdc593925"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-KhiopsVisualizationModule-c252b312dc97a3802bf866767c32312fa4c4d3c6992424adfa21db2f262753777aabd1807485746f63d39321180ca6c81fc5944824cfca6d583bfa7cdc593925"' :
                                        'id="xs-injectables-links-module-KhiopsVisualizationModule-c252b312dc97a3802bf866767c32312fa4c4d3c6992424adfa21db2f262753777aabd1807485746f63d39321180ca6c81fc5944824cfca6d583bfa7cdc593925"' }>
                                        <li class="link">
                                            <a href="injectables/ElectronService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ElectronService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#components-links"' :
                            'data-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/HomeLayoutComponent-1.html" data-type="entity-link" >HomeLayoutComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProjectViewComponent-1.html" data-type="entity-link" >ProjectViewComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TreeSelectComponent-1.html" data-type="entity-link" >TreeSelectComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UserSettingsComponent-1.html" data-type="entity-link" >UserSettingsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VariableGraphDetailsComponent-1.html" data-type="entity-link" >VariableGraphDetailsComponent</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#classes-links"' :
                            'data-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/BarVO.html" data-type="entity-link" >BarVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/CellsVO.html" data-type="entity-link" >CellsVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/CellVO.html" data-type="entity-link" >CellVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/ChartDatasetVO.html" data-type="entity-link" >ChartDatasetVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/ChartDatasI.html" data-type="entity-link" >ChartDatasI</a>
                            </li>
                            <li class="link">
                                <a href="classes/ClusterDetailsVO.html" data-type="entity-link" >ClusterDetailsVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/CompositionVO.html" data-type="entity-link" >CompositionVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/CoocurenceCellsVO.html" data-type="entity-link" >CoocurenceCellsVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/CoocurenceCellVO.html" data-type="entity-link" >CoocurenceCellVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/DimensionViewLayoutVO.html" data-type="entity-link" >DimensionViewLayoutVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/DimensionVO.html" data-type="entity-link" >DimensionVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/DistributionDatasVO.html" data-type="entity-link" >DistributionDatasVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/EvaluationPredictorVO.html" data-type="entity-link" >EvaluationPredictorVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/EvaluationTypeVO.html" data-type="entity-link" >EvaluationTypeVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/ExtDatasVO.html" data-type="entity-link" >ExtDatasVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/FileVO.html" data-type="entity-link" >FileVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/InformationsVO.html" data-type="entity-link" >InformationsVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/MatrixModesI.html" data-type="entity-link" >MatrixModesI</a>
                            </li>
                            <li class="link">
                                <a href="classes/MatrixOptionsI.html" data-type="entity-link" >MatrixOptionsI</a>
                            </li>
                            <li class="link">
                                <a href="classes/MatrixTargetsI.html" data-type="entity-link" >MatrixTargetsI</a>
                            </li>
                            <li class="link">
                                <a href="classes/ModelingDatasVO.html" data-type="entity-link" >ModelingDatasVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/ModelingPredictorVO.html" data-type="entity-link" >ModelingPredictorVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/NoteVO.html" data-type="entity-link" >NoteVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/PendingUpdateVO.html" data-type="entity-link" >PendingUpdateVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/Preparation2dDatasVO.html" data-type="entity-link" >Preparation2dDatasVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/Preparation2dVariableVO.html" data-type="entity-link" >Preparation2dVariableVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/PreparationVariableVO.html" data-type="entity-link" >PreparationVariableVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/ProjectSummaryVO.html" data-type="entity-link" >ProjectSummaryVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/SavedDatasVO.html" data-type="entity-link" >SavedDatasVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/SavedDatasVO-1.html" data-type="entity-link" >SavedDatasVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/SelectedClusterVO.html" data-type="entity-link" >SelectedClusterVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/SummaryVO.html" data-type="entity-link" >SummaryVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/TreeNodeVO.html" data-type="entity-link" >TreeNodeVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/TreeNodeVO-1.html" data-type="entity-link" >TreeNodeVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/TreePreparationDatasVO.html" data-type="entity-link" >TreePreparationDatasVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/TreePreparationVariableVO.html" data-type="entity-link" >TreePreparationVariableVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/Variable2dVO.html" data-type="entity-link" >Variable2dVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/VariableDetailsVO.html" data-type="entity-link" >VariableDetailsVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/VariableVO.html" data-type="entity-link" >VariableVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/ViewLayoutVO.html" data-type="entity-link" >ViewLayoutVO</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#injectables-links"' :
                                'data-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AnnotationService.html" data-type="entity-link" >AnnotationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AppService.html" data-type="entity-link" >AppService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AppService-1.html" data-type="entity-link" >AppService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ClustersService.html" data-type="entity-link" >ClustersService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CopyDatasService.html" data-type="entity-link" >CopyDatasService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DimensionsDatasService.html" data-type="entity-link" >DimensionsDatasService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/Distribution2dDatasService.html" data-type="entity-link" >Distribution2dDatasService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DistributionDatasService.html" data-type="entity-link" >DistributionDatasService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ElectronService.html" data-type="entity-link" >ElectronService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/EvaluationDatasService.html" data-type="entity-link" >EvaluationDatasService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/EventsService.html" data-type="entity-link" >EventsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FileLoaderService.html" data-type="entity-link" >FileLoaderService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FileSaverService.html" data-type="entity-link" >FileSaverService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ImportExtDatasService.html" data-type="entity-link" >ImportExtDatasService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ImportFileLoaderService.html" data-type="entity-link" >ImportFileLoaderService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/KhiopsLibraryService.html" data-type="entity-link" >KhiopsLibraryService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LibVersionService.html" data-type="entity-link" >LibVersionService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MatrixCanvasService.html" data-type="entity-link" >MatrixCanvasService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MatrixUtilsDatasService.html" data-type="entity-link" >MatrixUtilsDatasService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ModelingDatasService.html" data-type="entity-link" >ModelingDatasService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/Preparation2dDatasService.html" data-type="entity-link" >Preparation2dDatasService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PreparationDatasService.html" data-type="entity-link" >PreparationDatasService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ReleaseNotesService.html" data-type="entity-link" >ReleaseNotesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SaveService.html" data-type="entity-link" >SaveService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SaveService-1.html" data-type="entity-link" >SaveService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SelectableService.html" data-type="entity-link" >SelectableService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TreenodesService.html" data-type="entity-link" >TreenodesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TreePreparationDatasService.html" data-type="entity-link" >TreePreparationDatasService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UtilsService.html" data-type="entity-link" >UtilsService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interfaces-links"' :
                            'data-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/ChartColorsSetI.html" data-type="entity-link" >ChartColorsSetI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ChartToggleValuesI.html" data-type="entity-link" >ChartToggleValuesI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridColumnsI.html" data-type="entity-link" >GridColumnsI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridDatasI.html" data-type="entity-link" >GridDatasI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MatrixModeI.html" data-type="entity-link" >MatrixModeI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PageChangeEventI.html" data-type="entity-link" >PageChangeEventI</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#miscellaneous-links"'
                            : 'data-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});