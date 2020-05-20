import firebase from 'firebase';
import jwtDecode from 'jwt-decode';
import store from '../redux/store';
import {logoutUser} from '../redux/actions/userActions';

export async function verifyToken(){    
    const token = localStorage.authUser;
    if(token == null){
        throw new Error("LogOut")
    }
    else{
        const decodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 < Date.now()) {
            throw new Error("LogOut")
        }

        return decodedToken;
    }
}
