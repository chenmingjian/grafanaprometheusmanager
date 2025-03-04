import React, { useEffect, useState } from 'react';
import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { Alert, Badge, useStyles2, HorizontalGroup, Stack, Spinner, Icon, Tag } from '@grafana/ui';
import { PluginPage, getBackendSrv } from '@grafana/runtime';

// 根据后端响应结构调整类型定义
interface PrometheusRule {
  alert: string;
  expr: string;
  for?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
}

interface RuleGroup {
  name: string;
  rules: PrometheusRule[];
}

interface PrometheusRuleResource {
  spec: {
    groups: RuleGroup[];
  };
}

export function AlertRulesPage() {
  const theme = useStyles2(getStyles);
  const [rules, setRules] = useState<RuleGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAlertRules = async () => {
      try {
        const response = await getBackendSrv().get<{ items: PrometheusRuleResource[] }>(
          '/api/plugins/required-grafanaprometheusmanager-app/resources/prometheus/rules'
        );
        
        // 扁平化处理所有规则组
        const allGroups = response.items.flatMap(item => item.spec.groups);
        setRules(allGroups);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取告警规则失败');
      } finally {
        setLoading(false);
      }
    };

    fetchAlertRules();
  }, []);

  return (
    <PluginPage>
      <div className={theme.container}>
        <h2>Prometheus 告警规则</h2>
        
        {loading && <Spinner size="xl" />}
        
        {error && (
          <Alert title="错误" severity="error">
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <Stack direction="column" gap={4}>
            {rules.map((group) => (
              <div key={group.name} className={theme.groupContainer}>
                <div className={theme.groupHeader}>
                  <h4>{group.name}</h4>
                </div>
                <div className={theme.contentContainer}>
                  <Stack direction="column" gap={2}>
                    {group.rules.map((rule) => (
                      <Alert
                        key={rule.alert}
                        severity={rule.labels?.severity === 'critical' ? 'error' : 'warning'}
                        className={theme.alertContainer}
                        title={
                          <HorizontalGroup align="center" spacing="sm" >
                            <Icon name="bell" size="sm" />
                            <span className={theme.alertTitle}>{rule.alert}</span>
                            <Tag 
                              name={rule.labels?.severity || 'warning'} 
                              colorIndex={rule.labels?.severity === 'critical' ? 5 : 9}
                              icon={rule.labels?.severity === 'critical' ? 'exclamation-triangle' : 'info-circle'}
                            />
                          </HorizontalGroup>
                        }
                      >
                        <Stack direction="column" gap={1}>
                          <div className={theme.ruleMeta}>
                            {rule.for && (
                              <div className={theme.metaContainer}>
                                <Tag name={`持续时间: ${rule.for}`} colorIndex={3} icon="clock-nine" />
                              </div>
                            )}
                            <div className={theme.evaluation}>
                              <Icon name="dashboard" />
                              <span>评估频率: 每15秒</span>
                            </div>
                            <code className={theme.expression}>{rule.expr}</code>
                          </div>

                          {rule.labels && Object.keys(rule.labels).length > 0 && (
                            <div className={theme.labels}>
                              <strong>标签:</strong>
                              <HorizontalGroup spacing="sm">
                                {Object.entries(rule.labels).map(([key, value]) => (
                                  <Badge key={key} text={`${key}=${value}`} color="blue" />
                                ))}
                              </HorizontalGroup>
                            </div>
                          )}

                          {rule.annotations && Object.keys(rule.annotations).length > 0 && (
                            <div className={theme.annotations}>
                              <strong>注释:</strong>
                              <pre>{JSON.stringify(rule.annotations, null, 2)}</pre>
                            </div>
                          )}
                        </Stack>
                      </Alert>
                    ))}
                  </Stack>
                </div>
              </div>
            ))}
          </Stack>
        )}
      </div>
    </PluginPage>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  container: css/* container */`
    padding: ${theme.spacing(4)};
    display: block;
    max-width: 1400px;
    margin: 0 auto;
    background: ${theme.colors.background.primary};
    min-height: 100vh;
    
  `,

  header: css`
    display: block;
    align-items: center;
    margin-bottom: ${theme.spacing(4)};
    padding-bottom: ${theme.spacing(3)};
    border-bottom: 1px solid ${theme.colors.border.medium};
    
    h2 {
      margin: 0;
      font-size: ${theme.typography.h2.fontSize};
      font-weight: ${theme.typography.h2.fontWeight};
      color: ${theme.colors.text.primary};
      
      small {
        font-size: ${theme.typography.body.fontSize};
        color: ${theme.colors.text.secondary};
        margin-left: ${theme.spacing(2)};
      }
    }
  `,

  groupContainer: css`
    background: ${theme.colors.background.secondary};
    border-radius: 8px;
    padding: ${theme.spacing(3)};
    margin-bottom: ${theme.spacing(3)};
    box-shadow: ${theme.shadows.z1};
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing(2)};
    max-height: 600px;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${theme.shadows.z2};
    }
  `,

  groupHeader: css`
    display: block;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${theme.spacing(3)};
    padding-bottom: ${theme.spacing(2)};
    border-bottom: 1px solid ${theme.colors.border.weak};
    
    h4 {
      margin: 0;
      font-size: ${theme.typography.h4.fontSize};
      color: ${theme.colors.text.primary};
      display: block;
      align-items: center;
      
      svg {
        margin-right: ${theme.spacing(1)};
        color: ${theme.colors.primary.text};
      }
    }
  `,

  ruleItem: css`
    position: relative;
    border-left: 4px solid ${theme.colors.success.main};
    border-radius: 4px;
    margin-bottom: ${theme.spacing(2)};
    transition: all 0.2s ease;
    
    &:hover {
      border-left-color: ${theme.colors.primary.main};
      background: ${theme.colors.emphasize(theme.colors.background.secondary, 0.03)};
    }
    
    &[data-severity="critical"] {
      border-left-color: ${theme.colors.error.main};
    }
  `,

  ruleMeta: css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing(1.5)};
    position: relative;
  `,

  evaluation: css`
    order: -1;
    display: flex;
    align-items: center;
    gap: ${theme.spacing(1)};
    color: ${theme.colors.text.secondary};
    margin-bottom: ${theme.spacing(1)};
    background: ${theme.colors.emphasize(theme.colors.background.canvas, 0.03)};
    padding: ${theme.spacing(1)};
    border-radius: 4px;
  `,

  expression: css/* rule-expression */`
    padding: ${theme.spacing(1.5)};
    background: ${theme.colors.emphasize(theme.colors.background.canvas, 0.05)};
    border-radius: 4px;
    font-family: ${theme.typography.fontFamilyMonospace};
    font-size: ${theme.typography.bodySmall.fontSize};
    color: ${theme.colors.text.primary};
    max-width: 100%;
    overflow-x: auto;
    border: 1px solid ${theme.colors.border.weak};
    margin-top: ${theme.spacing(1)};
  `,

  metaContainer: css`
    gap: ${theme.spacing(1)};
    margin: ${theme.spacing(1.5)} 0;
    display: flex;
    flex-direction: column;
  `,

  labels: css`
    display: block;
    flex-wrap: wrap;
    gap: ${theme.spacing(1)};
    padding: ${theme.spacing(1.5)};
    background: ${theme.colors.emphasize(theme.colors.background.canvas, 0.02)};
    border-radius: 4px;
    border: 1px dashed ${theme.colors.border.weak};
  `,

  alertTitle: css`
    font-size: ${theme.typography.body.fontSize};
    font-weight: ${theme.typography.fontWeightMedium};
    margin-right: ${theme.spacing(1)};
    display: flex;
    flex-direction: column;
  `,

  contentContainer: css`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding-right: ${theme.spacing(1)};
    display: flex;
    flex-direction: column;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: ${theme.colors.background.canvas};
    }
    
    &::-webkit-scrollbar-thumb {
      background: ${theme.colors.border.weak};
      border-radius: 3px;
      
      &:hover {
        background: ${theme.colors.border.medium};
      }
    }
  `,

  alertContainer: css`
    /* 主容器布局 */
    .alert-1qzevvg {
      display: flex !important;
      flex-direction: row;
      align-items: center;
      gap: ${theme.spacing(2)};
      padding: ${theme.spacing(1.5)};
      background: ${theme.colors.background.secondary};
      border-radius: 4px;

      /* 图标调整 */
      .alert-icon-1n9tts5 {
        font-size: 24px;
        margin-right: ${theme.spacing(1)};
      }

      /* 内容区域 */
      .alert-content-1s3v1j0 {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing(1)};
      }

      /* 移动端适配 */
      @media (max-width: ${theme.breakpoints.values.md}px) {
        flex-direction: column;
        align-items: stretch;
      }
    }

    /* 标题样式 */
    .alert-title-1n9tts5 {
      font-size: ${theme.typography.h4.fontSize};
      margin-bottom: 0;
    }
  `,

  safeDisplayOverride: css`
    && {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: ${theme.spacing(2)};
    }
  `,

  alertHeader: css/* alert-header */`
    display: flex;
    align-items: center;
    flex-direction: column;
  `,

  horizontalAlert: css`
    .css-1qzevvg {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: ${theme.spacing(2)};
      padding: ${theme.spacing(2)};
      
      @media (max-width: ${theme.breakpoints.values.md}px) {
        flex-direction: column;
        align-items: stretch;
      }
    }

    .css-1s3v1j0 {
      flex: 1;
      display: flex;
      gap: ${theme.spacing(1)};
    }
  `,
});

export default AlertRulesPage;