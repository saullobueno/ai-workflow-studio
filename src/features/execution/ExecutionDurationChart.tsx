import { format } from 'date-fns'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import { CanvasRenderer } from 'echarts/renderers'
import type { ExecutionRecord } from '@/schemas/execution'

// Import modular (não `echarts-for-react` puro, que traz a lib inteira
// ~1MB): só o tipo de gráfico e os componentes que este chart usa.
echarts.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

interface ExecutionDurationChartProps {
  /** Mais recente primeiro (mesma ordem de `listExecutions`). */
  executions: ExecutionRecord[]
}

// Forma "emphasis": uma série (duração), destacando só o que importa (erros)
// em vermelho; sucesso fica no cinza de baixa ênfase. Cores literais (não
// tokens CSS/oklch) porque o canvas do ECharts não resolve var()/oklch().
const ERROR_COLOR = '#ef4444'
const SUCCESS_COLOR = '#a1a1aa'
const AXIS_LABEL_COLOR = '#71717a'
const GRID_LINE_COLOR = '#e4e4e7'

interface TooltipParam {
  dataIndex: number
  value: number
}

export function ExecutionDurationChart({
  executions,
}: ExecutionDurationChartProps) {
  if (executions.length < 2) return null

  // mais antigo -> mais recente, para o eixo correr da esquerda pra direita
  const ordered = [...executions].reverse()
  const durationsMs = ordered.map(
    (execution) =>
      new Date(execution.finishedAt).getTime() -
      new Date(execution.startedAt).getTime(),
  )
  const colors = ordered.map((execution) =>
    execution.status === 'error' ? ERROR_COLOR : SUCCESS_COLOR,
  )
  const labels = ordered.map((execution) =>
    format(new Date(execution.startedAt), 'HH:mm:ss'),
  )

  const option = {
    grid: { left: 44, right: 8, top: 12, bottom: 24 },
    xAxis: {
      type: 'category' as const,
      data: labels,
      axisLine: { lineStyle: { color: GRID_LINE_COLOR } },
      axisTick: { show: false },
      axisLabel: { color: AXIS_LABEL_COLOR, fontSize: 10 },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: {
        color: AXIS_LABEL_COLOR,
        fontSize: 10,
        formatter: '{value}ms',
      },
      splitLine: { lineStyle: { color: GRID_LINE_COLOR } },
    },
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: TooltipParam[]) => {
        const first = params[0]
        if (!first) return ''
        const execution = ordered[first.dataIndex]
        const statusLabel = execution?.status === 'error' ? 'Erro' : 'Sucesso'
        return `${statusLabel} · ${String(first.value)} ms`
      },
    },
    series: [
      {
        type: 'bar' as const,
        data: durationsMs,
        barMaxWidth: 24,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: (params: { dataIndex: number }) => colors[params.dataIndex],
        },
      },
    ],
  }

  return (
    <div>
      <div className="text-muted-foreground mb-1 flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block size-2 rounded-full"
            style={{ backgroundColor: SUCCESS_COLOR }}
            aria-hidden
          />
          Sucesso
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block size-2 rounded-full"
            style={{ backgroundColor: ERROR_COLOR }}
            aria-hidden
          />
          Erro
        </span>
        <span className="ml-auto">duração por execução</span>
      </div>
      <ReactEChartsCore
        echarts={echarts}
        option={option}
        style={{ height: 140 }}
        notMerge
      />
    </div>
  )
}
