import { About } from './about';
import { Checkbox } from './checkbox';
import { atomWithLocalStorage } from '@/utils/storage';
import tBiggerText from 'at/i18n/biggerText';
import tBlurOptions from 'at/i18n/blurOptions';
import tBlurOptionsDetail from 'at/i18n/blurOptionsDetail';
import tHideAbout from 'at/i18n/hideAbout';
import tHideQuestionType from 'at/i18n/hideQuestionType';
import tHideQuestionTypeDetail from 'at/i18n/hideQuestionTypeDetail';
import tHideTimer from 'at/i18n/hideTimer';
import tNoScroll from 'at/i18n/noScroll';
import tRandomOption from 'at/i18n/randomOption';
import tRandomOptionDetail from 'at/i18n/randomOptionDetail';
import tSelMenu from 'at/i18n/selMenu';
import tSelMenuDetail from 'at/i18n/selMenuDetail';
import { id } from 'at/options';
import { useAtom } from 'jotai';
import { FC } from 'react';

export const randomOptionsAtom = atomWithLocalStorage<boolean>(
  'randomOptions',
  true,
);
export const selectionMenuAtom = atomWithLocalStorage<boolean>(
  'selectionMenu',
  true,
);
export const hideAboutAtom = atomWithLocalStorage<boolean>('hideAbout', false);
export const biggerTextAtom = atomWithLocalStorage<boolean>(
  'biggerText',
  false,
);
export const hideTimerAtom = atomWithLocalStorage<boolean>('hideTimer', false);
export const hideQuestionTypeAtom = atomWithLocalStorage<boolean>(
  'hideQuestionType',
  false,
);
export const noScorllAtom = atomWithLocalStorage<boolean>('noScorll', true);
export const blurOptionsAtom = atomWithLocalStorage<boolean>(
  'blurOptions',
  false,
);

const CommonOptions: FC = () => {
  const [selectionMenu, setSelectionMenu] = useAtom(selectionMenuAtom);
  const [hideAbout, setHideAbout] = useAtom(hideAboutAtom);
  const [biggerText, setBiggerText] = useAtom(biggerTextAtom);
  const [hideTimer, setHideTimer] = useAtom(hideTimerAtom);
  const [noScorll, setNoScorll] = useAtom(noScorllAtom);

  return (
    <>
      <Checkbox
        title={tBiggerText}
        checked={biggerText}
        onChange={setBiggerText}
      />
      <Checkbox title={tNoScroll} checked={noScorll} onChange={setNoScorll} />
      <Checkbox
        title={tSelMenu}
        subtitle={tSelMenuDetail}
        checked={selectionMenu}
        onChange={setSelectionMenu}
      />
      <Checkbox
        title={tHideTimer}
        checked={hideTimer}
        onChange={setHideTimer}
      />
      <Checkbox
        title={tHideAbout}
        checked={hideAbout}
        onChange={setHideAbout}
      />
    </>
  );
};

let OptionList: FC;

// these branches can be treeshaken by rollup
if (id === 'mcq') {
  OptionList = () => {
    const [randomOptions, setRandomOptions] = useAtom(randomOptionsAtom);
    const [hideQuestionType, setHideQuestionType] =
      useAtom(hideQuestionTypeAtom);
    const [blurOptions, setBlurOptions] = useAtom(blurOptionsAtom);

    return (
      <>
        <Checkbox
          title={tHideQuestionType}
          checked={hideQuestionType}
          onChange={setHideQuestionType}
          subtitle={tHideQuestionTypeDetail}
        />
        <Checkbox
          title={tRandomOption}
          subtitle={tRandomOptionDetail}
          checked={randomOptions}
          onChange={setRandomOptions}
        />
        <Checkbox
          title={tBlurOptions}
          subtitle={tBlurOptionsDetail}
          checked={blurOptions}
          onChange={setBlurOptions}
        />
        <CommonOptions />
      </>
    );
  };
} else if (id === 'basic') {
  OptionList = CommonOptions;
} else if (id === 'tf') {
  OptionList = CommonOptions;
} else {
  OptionList = () => null;
}

export const Settings: FC = () => {
  return (
    <>
      <div className="flex flex-col gap-4">
        <OptionList />
      </div>
      <hr className="my-8" />
      <About />
    </>
  );
};
