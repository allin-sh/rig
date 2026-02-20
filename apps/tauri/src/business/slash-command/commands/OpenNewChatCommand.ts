import { ActionCommand, type SlashCommandContext } from '../ISlashCommand';

export class OpenNewChatCommand extends ActionCommand {
  public id = 'create-new-channel';
  public commandName = 'new';
  public description = 'Create a new chat';

  public execute(ctx: SlashCommandContext) {
    ctx.openNewChat();
  }
}
