//ANGULAR CORE
import { NgModule } from '@angular/core';

//ECHARTS
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts/core';
//import 'echarts-gl'; //ECHARTS 3D
import {
  BarChart,
  LineChart,
  PieChart
} from 'echarts/charts';
import {
  GraphicComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent
} from 'echarts/components';
import {
  CanvasRenderer
} from 'echarts/renderers';

//REGISTER ECHART PARTS
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  GraphicComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  CanvasRenderer
])

@NgModule({
  imports: [
    NgxEchartsModule
  ],
  exports: [
    NgxEchartsModule
  ]
})
export class EChartsModule { }