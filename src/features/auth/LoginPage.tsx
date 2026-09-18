import { LogIn, Workflow as WorkflowIcon } from 'lucide-react'
import { type SyntheticEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/design/ui/card'
import { Button } from '@/design/ui/button'
import { Input } from '@/design/ui/input'
import { Label } from '@/design/ui/label'
import { ThemeToggle } from '@/features/theme/ThemeToggle'
import { DEMO_CREDENTIALS, login } from './auth-storage'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState(DEMO_CREDENTIALS.email)
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password)

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()

    if (login(email, password)) {
      void navigate('/', { replace: true })
      return
    }

    toast.error('Credenciais inválidas', {
      description: 'Use as credenciais de demonstração exibidas abaixo.',
    })
  }

  return (
    <div className="relative flex flex-1 items-center justify-center p-6">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2">
            <WorkflowIcon className="text-primary size-6" aria-hidden />
            <CardTitle asChild>
              <h1 className="text-lg">AI Workflow Studio</h1>
            </CardTitle>
          </div>
          <CardDescription>
            Entre para acessar o editor de workflows. Este login é apenas uma
            simulação de portfólio — não há conta real por trás.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="login-email">E-mail</Label>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                }}
                autoComplete="email"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="login-password">Senha</Label>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                }}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="mt-2">
              <LogIn /> Entrar
            </Button>
          </CardContent>
        </form>

        <CardFooter className="flex-col items-start gap-1 border-t pt-4">
          <p className="text-muted-foreground text-xs font-medium">
            Credenciais de demonstração (já preenchidas acima):
          </p>
          <p className="text-muted-foreground text-xs">
            {DEMO_CREDENTIALS.email} / {DEMO_CREDENTIALS.password}
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
