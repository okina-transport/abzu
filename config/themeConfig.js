/*
 *  Licensed under the EUPL, Version 1.2 or – as soon they will be approved by
 the European Commission - subsequent versions of the EUPL (the "Licence");
 You may not use this work except in compliance with the Licence.
 You may obtain a copy of the Licence at:

 https://joinup.ec.europa.eu/software/page/eupl

 Unless required by applicable law or agreed to in writing, software
 distributed under the Licence is distributed on an "AS IS" basis,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the Licence for the specific language governing permissions and
 limitations under the Licence. */

import { getIn } from '../utils';
import { getEnvColor as defaultEnvColor } from './themes/default/defaultTheme';
import { getTheme as getDefaultTheme } from './themes/default/defaultTheme';
import defaultLogo from './themes/default/logo.png';
import { primary as defaultPrimary } from './themes/default/defaultTheme';
import {
  primaryDarker as defaultPrimaryDarker,
  darkColor as defaultDarkColor
} from './themes/default/defaultTheme';

export const getTiamatEnv = () => {
  return getIn(window, ['config', 'tiamatEnv'], 'development');
};

export const getEnvColor = env => {
  if (process.env.THEME) {
    return require('./themes/' + process.env.THEME + '/index.js').getEnvColor(
      env
    );
  } else {
    return defaultEnvColor(env);
  }
};

export const getTheme = () => {
  if (process.env.THEME) {
    return require('./themes/' + process.env.THEME + '/index.js').getTheme();
  } else {
    return getDefaultTheme();
  }
};

export const getLogo = () => {
  if (process.env.THEME) {
    return require('./themes/' + process.env.THEME + '/logo.png');
  } else {
    return defaultLogo;
  }
};

export const getPrimaryColor = () => {
  if (process.env.THEME) {
    return require('./themes/' + process.env.THEME + '/index.js').primary;
  } else {
    return defaultPrimary;
  }
};

export const getDarkColor = () => {
  if (process.env.THEME) {
    return require('./themes/' + process.env.THEME + '/index.js').darkColor;
  } else {
    return defaultDarkColor;
  }
};

export const getPrimaryDarkerColor = () => {
  if (process.env.THEME) {
    return require('./themes/' + process.env.THEME + '/index.js').primaryDarker;
  } else {
    return defaultPrimaryDarker;
  }
};
