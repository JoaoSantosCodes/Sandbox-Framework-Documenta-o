# Push automático para o GitHub ao final de cada rodada

Regra de processo adotada em 14/08/2026: o repositório
`JoaoSantosCodes/Sandbox-Framework-Documenta-o` deve acompanhar o checkpoint
publicado mais recente do site — nunca ficar para trás dele.

## Por que não é automático por si só

O checkpoint do webdev (`webdev_save_checkpoint`) publica o site imediatamente
(auto-publish habilitado), mas o espelho do GitHub usa um remote `github`
apontando para o repositório do usuário — o push só acontece quando uma ação
o executa. Este documento registra o procedimento obrigatório para fechar o
ciclo ao final de **cada rodada** com mudanças homologáveis no site.

## Procedimento (executado pelo agente ao final de toda rodada)

1. Após `webdev_save_checkpoint` bem-sucedido e validação (tsc limpo + screenshot),
   rodar no diretório do projeto:
   ```bash
   cd /home/ubuntu/sandbox-framework-docs
   git push github main
   ```
2. Verificar a resposta do push (`X..Y  main -> main`) e, em caso de conflito,
   `git fetch github && git merge github/main --no-edit` antes de repetir o push.
3. Confirmar com `git log --oneline -1 github/main` e reportar o commit ao usuário.
4. Sincronizar também a skill (`cp skills/sandbox-framework-review/SKILL.md`
   para o arquivo do projeto compartilhado, `sfr_skill.md`).

## Roteiro alternativo para push manual do usuário

Se preferir fazer o push por conta própria (ou se o sandbox estiver desligado):

```bash
git clone https://github.com/JoaoSantosCodes/Sandbox-Framework-Documenta-o.git
cd Sandbox-Framework-Documenta-o
git pull origin main
git push origin main
```

O site de produção não depende do repositório (publicação via Manus), mas a
auditoria Vault ↔ site e o histórico de decisões dependem do GitHub estar em dia.

## Verificação

A cada rodada, o commit local (`git log -1 --format=%H`) deve ser igual ao do
remoto (`git log -1 --format=%H github/main`). Divergência = rodar o procedimento
antes de entregar.
