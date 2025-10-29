import { useSetAtom } from 'jotai';
import { useHotkeys } from 'react-hotkeys-hook';
import { textAreaFocusTrigger$ } from '../chat/UserInput';
import { isLeftPanelOpenAtom } from '../leftPanel/leftPanelStore';

export const HotkeyHandler = () => {
  const setIsLeftPanelOpen = useSetAtom(isLeftPanelOpenAtom);
  useHotkeys('mod+b', () => {
    setIsLeftPanelOpen(prev => !prev);
  });
  useHotkeys('Slash', e => {
    // Slash 를 누르면 텍스트 영역 포커스 외에 / 가 한번 입력되는 이슈가 있었음.
    // / 가 입력되지 않게 하기 위해 e.preventDefault() 를 사용하여 기본 동작을 방지
    e.preventDefault();
    textAreaFocusTrigger$.next();
  });
  return null;
};
