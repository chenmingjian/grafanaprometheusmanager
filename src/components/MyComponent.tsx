import { useStyles2 } from '@grafana/ui';

const getStyles = (theme: GrafanaTheme2) => ({
  customContainer: css`
    display: ${theme.components.layout.display.flex};
    flex-direction: column;
  `,
}); 