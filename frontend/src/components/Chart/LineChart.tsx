import { type DataChartType } from '.';
import ColumnChart from './ColumnChart';

const LineChart = (props: DataChartType) => {
	return <ColumnChart {...props} type='line' />;
};

export default LineChart;
