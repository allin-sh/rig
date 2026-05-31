import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Effect } from 'effect';
import { removeSkillRoot } from './api';
import { skillRootsQueryKey } from './useSkillRoots';

export const useRemoveSkillRoot = ({
  onRemoved,
}: {
  onRemoved?: (rootId: string) => void;
} = {}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (rootId: string) => Effect.runPromise(removeSkillRoot(rootId)),
    onSuccess: (_, rootId) => {
      onRemoved?.(rootId);
      void queryClient.invalidateQueries({ queryKey: skillRootsQueryKey });
    },
  });

  return {
    removeRoot: mutation.mutate,
    isRemoving: mutation.isPending,
  };
};
