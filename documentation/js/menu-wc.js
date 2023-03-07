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
                                            'data-target="#components-links-module-AppModule-46d6b613b49a252d0a0bc1cf0ef0e3d1ae5c9747704af818f4bee595f0a5991363cc89342ee6b2173cd9056e6235a3a9fbfb0fae7d8de0af7530d6c9c46d170f"' : 'data-target="#xs-components-links-module-AppModule-46d6b613b49a252d0a0bc1cf0ef0e3d1ae5c9747704af818f4bee595f0a5991363cc89342ee6b2173cd9056e6235a3a9fbfb0fae7d8de0af7530d6c9c46d170f"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-46d6b613b49a252d0a0bc1cf0ef0e3d1ae5c9747704af818f4bee595f0a5991363cc89342ee6b2173cd9056e6235a3a9fbfb0fae7d8de0af7530d6c9c46d170f"' :
                                            'id="xs-components-links-module-AppModule-46d6b613b49a252d0a0bc1cf0ef0e3d1ae5c9747704af818f4bee595f0a5991363cc89342ee6b2173cd9056e6235a3a9fbfb0fae7d8de0af7530d6c9c46d170f"' }>
                                            <li class="link">
                                                <a href="components/AppComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AppModule-68e681c03584dfa043a9466bfd6c500164664ebabe4dd44e09a6c221f2750cebeeec32317125c0afa60f7bd42728f2f1b5ac47ad057e3f575d73c0af4fc8e6a6-1"' : 'data-target="#xs-components-links-module-AppModule-68e681c03584dfa043a9466bfd6c500164664ebabe4dd44e09a6c221f2750cebeeec32317125c0afa60f7bd42728f2f1b5ac47ad057e3f575d73c0af4fc8e6a6-1"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-68e681c03584dfa043a9466bfd6c500164664ebabe4dd44e09a6c221f2750cebeeec32317125c0afa60f7bd42728f2f1b5ac47ad057e3f575d73c0af4fc8e6a6-1"' :
                                            'id="xs-components-links-module-AppModule-68e681c03584dfa043a9466bfd6c500164664ebabe4dd44e09a6c221f2750cebeeec32317125c0afa60f7bd42728f2f1b5ac47ad057e3f575d73c0af4fc8e6a6-1"' }>
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
                                        'data-target="#injectables-links-module-AppModule-68e681c03584dfa043a9466bfd6c500164664ebabe4dd44e09a6c221f2750cebeeec32317125c0afa60f7bd42728f2f1b5ac47ad057e3f575d73c0af4fc8e6a6-1"' : 'data-target="#xs-injectables-links-module-AppModule-68e681c03584dfa043a9466bfd6c500164664ebabe4dd44e09a6c221f2750cebeeec32317125c0afa60f7bd42728f2f1b5ac47ad057e3f575d73c0af4fc8e6a6-1"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-68e681c03584dfa043a9466bfd6c500164664ebabe4dd44e09a6c221f2750cebeeec32317125c0afa60f7bd42728f2f1b5ac47ad057e3f575d73c0af4fc8e6a6-1"' :
                                        'id="xs-injectables-links-module-AppModule-68e681c03584dfa043a9466bfd6c500164664ebabe4dd44e09a6c221f2750cebeeec32317125c0afa60f7bd42728f2f1b5ac47ad057e3f575d73c0af4fc8e6a6-1"' }>
                                        <li class="link">
                                            <a href="injectables/ElectronService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ElectronService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AppModule-5083455a5470d9879a44a53e517d006d0b13574dab069e43107b618aea483ecc148c6b38f8b44ba95fb6654422ec112ed30281774e505ed2abf4f266c97c6c6b-2"' : 'data-target="#xs-components-links-module-AppModule-5083455a5470d9879a44a53e517d006d0b13574dab069e43107b618aea483ecc148c6b38f8b44ba95fb6654422ec112ed30281774e505ed2abf4f266c97c6c6b-2"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-5083455a5470d9879a44a53e517d006d0b13574dab069e43107b618aea483ecc148c6b38f8b44ba95fb6654422ec112ed30281774e505ed2abf4f266c97c6c6b-2"' :
                                            'id="xs-components-links-module-AppModule-5083455a5470d9879a44a53e517d006d0b13574dab069e43107b618aea483ecc148c6b38f8b44ba95fb6654422ec112ed30281774e505ed2abf4f266c97c6c6b-2"' }>
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
                                        'data-target="#injectables-links-module-AppModule-5083455a5470d9879a44a53e517d006d0b13574dab069e43107b618aea483ecc148c6b38f8b44ba95fb6654422ec112ed30281774e505ed2abf4f266c97c6c6b-2"' : 'data-target="#xs-injectables-links-module-AppModule-5083455a5470d9879a44a53e517d006d0b13574dab069e43107b618aea483ecc148c6b38f8b44ba95fb6654422ec112ed30281774e505ed2abf4f266c97c6c6b-2"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-5083455a5470d9879a44a53e517d006d0b13574dab069e43107b618aea483ecc148c6b38f8b44ba95fb6654422ec112ed30281774e505ed2abf4f266c97c6c6b-2"' :
                                        'id="xs-injectables-links-module-AppModule-5083455a5470d9879a44a53e517d006d0b13574dab069e43107b618aea483ecc148c6b38f8b44ba95fb6654422ec112ed30281774e505ed2abf4f266c97c6c6b-2"' }>
                                        <li class="link">
                                            <a href="injectables/ElectronService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ElectronService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppRoutingModule.html" data-type="entity-link" >AppRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AppRoutingModule.html" data-type="entity-link" >AppRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/KhiopsCovisualizationModule.html" data-type="entity-link" >KhiopsCovisualizationModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/KhiopsHypertreeModule.html" data-type="entity-link" >KhiopsHypertreeModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/KhiopsLibraryModule.html" data-type="entity-link" >KhiopsLibraryModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-KhiopsLibraryModule-e39c6306ee14b17160426d7999586f6089d11e97ccc1ea74cc29a297a7eef1be2ffa642c6b97da9f7dfc91d404e91bb737b72829cc3c4a779552704e936b1afe"' : 'data-target="#xs-components-links-module-KhiopsLibraryModule-e39c6306ee14b17160426d7999586f6089d11e97ccc1ea74cc29a297a7eef1be2ffa642c6b97da9f7dfc91d404e91bb737b72829cc3c4a779552704e936b1afe"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-KhiopsLibraryModule-e39c6306ee14b17160426d7999586f6089d11e97ccc1ea74cc29a297a7eef1be2ffa642c6b97da9f7dfc91d404e91bb737b72829cc3c4a779552704e936b1afe"' :
                                            'id="xs-components-links-module-KhiopsLibraryModule-e39c6306ee14b17160426d7999586f6089d11e97ccc1ea74cc29a297a7eef1be2ffa642c6b97da9f7dfc91d404e91bb737b72829cc3c4a779552704e936b1afe"' }>
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
                                            'data-target="#pipes-links-module-KhiopsLibraryModule-e39c6306ee14b17160426d7999586f6089d11e97ccc1ea74cc29a297a7eef1be2ffa642c6b97da9f7dfc91d404e91bb737b72829cc3c4a779552704e936b1afe"' : 'data-target="#xs-pipes-links-module-KhiopsLibraryModule-e39c6306ee14b17160426d7999586f6089d11e97ccc1ea74cc29a297a7eef1be2ffa642c6b97da9f7dfc91d404e91bb737b72829cc3c4a779552704e936b1afe"' }>
                                            <span class="icon ion-md-add"></span>
                                            <span>Pipes</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="pipes-links-module-KhiopsLibraryModule-e39c6306ee14b17160426d7999586f6089d11e97ccc1ea74cc29a297a7eef1be2ffa642c6b97da9f7dfc91d404e91bb737b72829cc3c4a779552704e936b1afe"' :
                                            'id="xs-pipes-links-module-KhiopsLibraryModule-e39c6306ee14b17160426d7999586f6089d11e97ccc1ea74cc29a297a7eef1be2ffa642c6b97da9f7dfc91d404e91bb737b72829cc3c4a779552704e936b1afe"' }>
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
                            </li>
                            <li class="link">
                                <a href="modules/KhiopsVisualizationSharedModule.html" data-type="entity-link" >KhiopsVisualizationSharedModule</a>
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
                                <a href="classes/Animation.html" data-type="entity-link" >Animation</a>
                            </li>
                            <li class="link">
                                <a href="classes/ArcLayer.html" data-type="entity-link" >ArcLayer</a>
                            </li>
                            <li class="link">
                                <a href="classes/BackgroundLayer.html" data-type="entity-link" >BackgroundLayer</a>
                            </li>
                            <li class="link">
                                <a href="classes/BarVO.html" data-type="entity-link" >BarVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/CellLayer.html" data-type="entity-link" >CellLayer</a>
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
                                <a href="classes/D3UpdatePattern.html" data-type="entity-link" >D3UpdatePattern</a>
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
                                <a href="classes/FocusLayer.html" data-type="entity-link" >FocusLayer</a>
                            </li>
                            <li class="link">
                                <a href="classes/Frame.html" data-type="entity-link" >Frame</a>
                            </li>
                            <li class="link">
                                <a href="classes/HyperbolicTransformation.html" data-type="entity-link" >HyperbolicTransformation</a>
                            </li>
                            <li class="link">
                                <a href="classes/Hypertree.html" data-type="entity-link" >Hypertree</a>
                            </li>
                            <li class="link">
                                <a href="classes/ImageLayer.html" data-type="entity-link" >ImageLayer</a>
                            </li>
                            <li class="link">
                                <a href="classes/InformationsVO.html" data-type="entity-link" >InformationsVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/InputFile.html" data-type="entity-link" >InputFile</a>
                            </li>
                            <li class="link">
                                <a href="classes/InputJSON.html" data-type="entity-link" >InputJSON</a>
                            </li>
                            <li class="link">
                                <a href="classes/InputSkos.html" data-type="entity-link" >InputSkos</a>
                            </li>
                            <li class="link">
                                <a href="classes/InputTreeML.html" data-type="entity-link" >InputTreeML</a>
                            </li>
                            <li class="link">
                                <a href="classes/InteractionLayer.html" data-type="entity-link" >InteractionLayer</a>
                            </li>
                            <li class="link">
                                <a href="classes/InteractionLayer2.html" data-type="entity-link" >InteractionLayer2</a>
                            </li>
                            <li class="link">
                                <a href="classes/InvalidFileError.html" data-type="entity-link" >InvalidFileError</a>
                            </li>
                            <li class="link">
                                <a href="classes/LabelForceLayer.html" data-type="entity-link" >LabelForceLayer</a>
                            </li>
                            <li class="link">
                                <a href="classes/LabelLayer.html" data-type="entity-link" >LabelLayer</a>
                            </li>
                            <li class="link">
                                <a href="classes/LayerStack.html" data-type="entity-link" >LayerStack</a>
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
                                <a href="classes/MissingFieldError.html" data-type="entity-link" >MissingFieldError</a>
                            </li>
                            <li class="link">
                                <a href="classes/ModelingDatasVO.html" data-type="entity-link" >ModelingDatasVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/ModelingPredictorVO.html" data-type="entity-link" >ModelingPredictorVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/MouseDownState.html" data-type="entity-link" >MouseDownState</a>
                            </li>
                            <li class="link">
                                <a href="classes/NegTransformation.html" data-type="entity-link" >NegTransformation</a>
                            </li>
                            <li class="link">
                                <a href="classes/NodeLayer.html" data-type="entity-link" >NodeLayer</a>
                            </li>
                            <li class="link">
                                <a href="classes/NoInteractionState.html" data-type="entity-link" >NoInteractionState</a>
                            </li>
                            <li class="link">
                                <a href="classes/NoteVO.html" data-type="entity-link" >NoteVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/PanTransformation.html" data-type="entity-link" >PanTransformation</a>
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
                                <a href="classes/RDFHelper.html" data-type="entity-link" >RDFHelper</a>
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
                                <a href="classes/StemLayer.html" data-type="entity-link" >StemLayer</a>
                            </li>
                            <li class="link">
                                <a href="classes/SummaryVO.html" data-type="entity-link" >SummaryVO</a>
                            </li>
                            <li class="link">
                                <a href="classes/SymbolLayer.html" data-type="entity-link" >SymbolLayer</a>
                            </li>
                            <li class="link">
                                <a href="classes/TraceLayer.html" data-type="entity-link" >TraceLayer</a>
                            </li>
                            <li class="link">
                                <a href="classes/TransformationCache.html" data-type="entity-link" >TransformationCache</a>
                            </li>
                            <li class="link">
                                <a href="classes/Transition.html" data-type="entity-link" >Transition</a>
                            </li>
                            <li class="link">
                                <a href="classes/Tree.html" data-type="entity-link" >Tree</a>
                            </li>
                            <li class="link">
                                <a href="classes/TreeNode.html" data-type="entity-link" >TreeNode</a>
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
                                <a href="classes/UnitDisk.html" data-type="entity-link" >UnitDisk</a>
                            </li>
                            <li class="link">
                                <a href="classes/UnitDiskNav.html" data-type="entity-link" >UnitDiskNav</a>
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
                                <a href="interfaces/ArcLayerArgs.html" data-type="entity-link" >ArcLayerArgs</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BackgroundLayerArgs.html" data-type="entity-link" >BackgroundLayerArgs</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CellLayerArgs.html" data-type="entity-link" >CellLayerArgs</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ChartColorsSetI.html" data-type="entity-link" >ChartColorsSetI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ChartToggleValuesI.html" data-type="entity-link" >ChartToggleValuesI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/D3UpdatePatternArgs.html" data-type="entity-link" >D3UpdatePatternArgs</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DragState.html" data-type="entity-link" >DragState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FocusLayerArgs.html" data-type="entity-link" >FocusLayerArgs</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridColumnsI.html" data-type="entity-link" >GridColumnsI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridDatasI.html" data-type="entity-link" >GridDatasI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HypertreeArgs.html" data-type="entity-link" >HypertreeArgs</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ILayer.html" data-type="entity-link" >ILayer</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ILayerArgs.html" data-type="entity-link" >ILayerArgs</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ILayerView.html" data-type="entity-link" >ILayerView</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ImageLayerArgs.html" data-type="entity-link" >ImageLayerArgs</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/InteractionLayer2Args.html" data-type="entity-link" >InteractionLayer2Args</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/InteractionLayerArgs.html" data-type="entity-link" >InteractionLayerArgs</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUnitDisk.html" data-type="entity-link" >IUnitDisk</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LabelForceLayerArgs.html" data-type="entity-link" >LabelForceLayerArgs</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LabelLayerArgs.html" data-type="entity-link" >LabelLayerArgs</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LayerStackArgs.html" data-type="entity-link" >LayerStackArgs</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MatrixModeI.html" data-type="entity-link" >MatrixModeI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/N.html" data-type="entity-link" >N</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NodeLayerArgs.html" data-type="entity-link" >NodeLayerArgs</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NodeLayout.html" data-type="entity-link" >NodeLayout</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NodePath.html" data-type="entity-link" >NodePath</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NodePrecalulations.html" data-type="entity-link" >NodePrecalulations</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NodeTransformation.html" data-type="entity-link" >NodeTransformation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PageChangeEventI.html" data-type="entity-link" >PageChangeEventI</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Path.html" data-type="entity-link" >Path</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StemLayerArgs.html" data-type="entity-link" >StemLayerArgs</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SymbolLayerArgs.html" data-type="entity-link" >SymbolLayerArgs</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/T.html" data-type="entity-link" >T</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Trace.html" data-type="entity-link" >Trace</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TraceLayerArgs.html" data-type="entity-link" >TraceLayerArgs</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Transformation.html" data-type="entity-link" >Transformation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UnitDiskArgs.html" data-type="entity-link" >UnitDiskArgs</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UnitDiskView.html" data-type="entity-link" >UnitDiskView</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VisitArgs.html" data-type="entity-link" >VisitArgs</a>
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
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
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