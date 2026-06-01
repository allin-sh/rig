import { useQuery } from '@tanstack/react-query';
import { Effect } from 'effect';
import {
  listSkillsFromRoots,
  listSkillUsages,
  listSkillUsagesTendency,
} from '../api';
import type { Skill, SkillRoot } from '../types';
import { SkillList } from './SkillList';

interface SkillSidebarProps {
  roots: SkillRoot[];
  selectedSkill: Skill | null;
  onSelectSkill: (skill: Skill) => void;
}

export const SkillSidebar = ({
  roots,
  selectedSkill,
  onSelectSkill,
}: SkillSidebarProps) => {
  const rootPaths = roots.map(root => root.path);
  const {
    data: skills = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['skills', rootPaths],
    queryFn: () => Effect.runPromise(listSkillsFromRoots(rootPaths)),
  });

  const { data: skillUsages = [] } = useQuery({
    queryKey: ['skill-usages', 'month'],
    queryFn: () => Effect.runPromise(listSkillUsages('month')),
  });

  const { data: skillUsageTendencies = [] } = useQuery({
    queryKey: ['skill-usages-tendency', 'month', 'day'],
    queryFn: () => Effect.runPromise(listSkillUsagesTendency('month', 'day')),
  });

  return (
    <SkillList
      skills={skills}
      selectedSkill={selectedSkill}
      skillUsages={skillUsages}
      skillUsageTendencies={skillUsageTendencies}
      isLoading={isLoading}
      error={error ? String(error) : null}
      onSelectSkill={onSelectSkill}
    />
  );
};
