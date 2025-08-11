//ANGULAR CORE
import { NgModule } from '@angular/core';

//ECHARTS
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts/core';
//import 'echarts-gl'; //ECHARTS 3D
import {
  BarChart,
  LineChart
} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components';
import {
  CanvasRenderer
} from 'echarts/renderers';

//REGISTER ECHART PARTS
echarts.use([
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer
])

@NgModule({
  imports: [
    NgxEchartsModule.forRoot({ echarts: () => Promise.resolve(echarts) })
  ],
  exports: [
    NgxEchartsModule
  ]
})
export class EChartsModule { }