// index.js
import { setCustomText, setCustomTextInput } from 'react-native-global-props';

// 모든 Text에 기본 폰트 지정 (명시 스타일과 merge 됨)
const customTextProps = {
  style: { fontFamily: 'Hakgyoansim' }
};
setCustomText(customTextProps);

// (선택) TextInput에도 동일 폰트 적용
const customTextInputProps = {
  style: { fontFamily: 'Hakgyoansim' }
};
setCustomTextInput(customTextInputProps);

import 'react-native-gesture-handler';

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
