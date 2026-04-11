import { Button, Input } from '@allin/ui';
import { Loader2, RefreshCw } from 'lucide-react';
import { use } from 'react';
import { ConfigFileWorkbenchContext } from '../ConfigFileWorkbenchProvider';
import { getIconUrl } from '../configFileWorkbenchUtils';
import { CreateFormIconSectionView } from './CreateFormIconSectionView';
import { CreateFormPathSectionView } from './CreateFormPathSectionView';
import { CreateFormTypeSectionView } from './CreateFormTypeSectionView';

export const CreateFormView = () => {
  const context = use(ConfigFileWorkbenchContext);

  if (!context) {
    throw new Error(
      'CreateFormView must be used within ConfigFileWorkbenchProvider',
    );
  }

  const selectedPresetCount = context.selectedPresetEntryIds.length;

  return (
    <div className='h-full flex items-center justify-center p-6'>
      <div className='w-full max-w-xl rounded-xl border bg-card p-6 flex flex-col gap-4'>
        <div>
          <h2 className='text-lg font-semibold'>Add Settings Entry</h2>
          <p className='text-sm text-muted-foreground mt-1'>
            Register a local file or folder and browse it from the sidebar.
          </p>
        </div>

        <div className='rounded-xl border bg-muted/30 p-4 flex flex-col gap-3'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <h3 className='text-sm font-medium'>Common App Settings</h3>
              <p className='text-sm text-muted-foreground mt-1'>
                Scan popular app config paths, then choose which ones to add.
              </p>
            </div>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                void context.scanPresetEntries();
              }}
              disabled={context.isCheckingPresetEntries}
            >
              {context.isCheckingPresetEntries ? (
                <Loader2 className='mr-2 size-4 animate-spin' />
              ) : (
                <RefreshCw className='mr-2 size-4' />
              )}
              Scan
            </Button>
          </div>

          {context.checkedPresetEntries.length > 0 ? (
            <div className='flex flex-col gap-2'>
              <div className='max-h-64 overflow-y-auto rounded-lg border bg-background'>
                {context.checkedPresetEntries.map(preset => {
                  const isSelectable =
                    preset.exists &&
                    preset.matchesType &&
                    !preset.alreadyRegistered;
                  const iconUrl = getIconUrl(
                    preset.iconType,
                    preset.iconValue,
                    context.isDarkMode,
                  );

                  return (
                    <label
                      key={preset.presetId}
                      className='flex items-start gap-3 border-b last:border-b-0 px-3 py-3'
                    >
                      <input
                        type='checkbox'
                        className='mt-1 h-4 w-4'
                        checked={context.selectedPresetEntryIds.includes(
                          preset.presetId,
                        )}
                        disabled={!isSelectable}
                        onChange={() => {
                          context.togglePresetEntrySelection(preset.presetId);
                        }}
                      />
                      {iconUrl ? (
                        <img
                          src={iconUrl}
                          alt=''
                          className='mt-0.5 size-5 rounded-sm object-contain'
                        />
                      ) : (
                        <div className='mt-0.5 size-5 rounded-sm bg-muted' />
                      )}
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center justify-between gap-2'>
                          <span className='text-sm font-medium'>
                            {preset.name}
                          </span>
                          <span className='text-xs text-muted-foreground'>
                            {preset.alreadyRegistered
                              ? 'Already added'
                              : preset.exists && preset.matchesType
                                ? 'Available'
                                : !preset.exists
                                  ? 'Not found'
                                  : !preset.matchesType
                                    ? 'Type mismatch'
                                    : 'Error'}
                          </span>
                        </div>
                        <p className='mt-1 break-all text-xs text-muted-foreground'>
                          {preset.resolvedPath}
                        </p>
                        {preset.message ? (
                          <p className='mt-1 text-xs text-muted-foreground'>
                            {preset.message}
                          </p>
                        ) : null}
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className='flex items-center justify-between gap-3'>
                <p className='text-xs text-muted-foreground'>
                  {selectedPresetCount > 0
                    ? `${selectedPresetCount} preset ${selectedPresetCount === 1 ? 'selected' : 'selected'}`
                    : 'Select available presets to register them.'}
                </p>
                <Button
                  type='button'
                  variant='secondary'
                  onClick={() => {
                    void context.registerSelectedPresetEntries();
                  }}
                  disabled={selectedPresetCount === 0}
                >
                  Add Selected
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <CreateFormTypeSectionView
          isDirectory={context.newIsDirectory}
          onSelectFile={() => context.setNewIsDirectory(false)}
          onSelectFolder={() => context.setNewIsDirectory(true)}
        />

        <CreateFormIconSectionView
          isDirectory={context.newIsDirectory}
          iconType={context.newIconType}
          iconValue={context.newIconValue}
          iconDisplayUrl={context.newIconDisplayUrl}
          isDarkMode={context.isDarkMode}
          isIconPopoverOpen={context.isIconPopoverOpen}
          iconUploadInputRef={context.iconUploadInputRef}
          onOpenChange={context.setNewIconPopoverOpen}
          onUploadImage={event => {
            void context.uploadIcon(event);
          }}
          onSelectPreset={context.selectPresetIcon}
          onClearIcon={context.clearIcon}
        />

        <div className='flex flex-col gap-2'>
          <label className='text-sm font-medium' htmlFor='config-file-name'>
            Name
          </label>
          <Input
            id='config-file-name'
            placeholder={
              context.newIsDirectory
                ? 'e.g. Neovim Config'
                : 'e.g. Zed Settings'
            }
            value={context.newName}
            onChange={event => context.setNewName(event.target.value)}
          />
        </div>

        <CreateFormPathSectionView
          isDirectory={context.newIsDirectory}
          path={context.newPath}
          isPickingPath={context.isPickingPath}
          onChangePath={context.setNewPath}
          onBrowsePath={() => {
            void context.pickPath();
          }}
        />

        <div className='flex items-center justify-end gap-2 pt-2'>
          <Button
            type='button'
            variant='outline'
            onClick={() => context.setPane('content')}
          >
            Cancel
          </Button>
          <Button
            type='button'
            onClick={() => {
              void context.createEntry();
            }}
          >
            {context.newIsDirectory ? 'Add Folder' : 'Add File'}
          </Button>
        </div>
      </div>
    </div>
  );
};
