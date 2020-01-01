import { UserActions } from './user.actions';
import * as userActions from './user.actions';

export function reducer(state: any, action: userActions.UserAction) {

    const payload = action['payload'] || null;

    switch (action.type) {

        case UserActions.LoginComplete:
            return payload.error ? payload : {
                uid: payload.uid,
                name: payload.displayName,
                email: payload.email,
                token: payload.token,
                picture: payload.additionalUserInfo.profile.picture,
                locale: payload.additionalUserInfo.profile.locale,
                isNewUser: payload.additionalUserInfo.isNewUser
            }

        case UserActions.LoginFail:
        case UserActions.LogoutComplete:
            return {}

        case UserActions.LogoutFail:
            return { ...state }

        default: return { ...state }
    }

}