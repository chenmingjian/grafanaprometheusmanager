import { GrafanaPlugin } from '@grafana/data';
import { CustomTheme } from './theme';

export const plugin = new GrafanaPlugin({
  theme: CustomTheme,
}); 