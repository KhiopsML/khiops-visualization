import { DynamicI } from '@khiops-library/interfaces/globals';
import { ModelingReport } from './modeling-report';

export interface AppDatasI {
  datas: VisualizationDatas;
  //   savedDatas?: any;
}

export interface VisualizationDatas {
  tool: string;
  version: string;
  shortDescription: string;
  modelingReport: ModelingReport;
  trainEvaluationReport: TrainEvaluationReport | any;
  testEvaluationReport: TestEvaluationReport | any;
  preparationReport: PreparationReport | any;
  treePreparationReport: TreePreparationReport | any;
  bivariatePreparationReport: BivariatePreparationReport | any;
  textPreparationReport: TextPreparationReport | any;
  evaluationReport: EvaluationReport | any;
  logs: Log[];
  savedDatas: DynamicI;
}

interface TestEvaluationReport {}

interface PreparationReport {}

interface TrainEvaluationReport {}

interface TreePreparationReport {}

interface BivariatePreparationReport {}

interface TextPreparationReport {}

interface EvaluationReport {}

interface Log {
  taskName: string;
  messages: string[];
}
