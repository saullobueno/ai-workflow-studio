import { Link } from 'react-router-dom'
import { Button } from '@/design/ui/button'

export function NotFoundRoute() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">Página não encontrada</h1>
      <p className="text-muted-foreground text-sm">
        O endereço acessado não existe.
      </p>
      <Button asChild>
        <Link to="/">Voltar para os workflows</Link>
      </Button>
    </div>
  )
}
