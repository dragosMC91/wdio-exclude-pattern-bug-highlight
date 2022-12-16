import merge from 'deepmerge';
import {CommonPages} from 'commons/commonPages';
import HomePage from '#app/pageObjects/home';

export const AppPages = merge(CommonPages, {
    desktop: {
        HomePage: HomePage,
    },
    mobile: {
        HomePage: HomePage,
    }
    
})