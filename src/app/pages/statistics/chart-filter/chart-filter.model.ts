type chartFilterType = 'radio' | 'dropdown' | 'yearrange' | 'checkbox';
interface chartFilterOption {
  label: string;
  value: any;
}
export interface chartFilterConfig {
  key: string;
  label?: string;
  type: chartFilterType;
  model: any;
  options?: chartFilterOption[];
  minDate?: Date;
  maxDate?: Date;
  include?: boolean;
}