import { GrafanaTheme2 } from '@grafana/data';

export const CustomTheme: GrafanaTheme2 = {
  ...grafanaTheme, // 继承默认主题
  components: {
    ...grafanaTheme.components,
    // 覆盖布局相关配置
    layout: {
      display: {
        flex: 'flex',
        block: 'block',
        inlineBlock: 'inline-block',
        grid: 'grid'
      }
    }
  }
}; 