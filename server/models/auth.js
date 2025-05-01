const { CustomError, statusCodes } = require('./errors');
const { connect } = require('./supabase');

async function signUp(email, password) {
    const supabase = connect();
    const { data, error } = await supabase.auth.signUp({
        email,
        password
    });
    
    if (error) {
        throw new CustomError(`Sign up failed: ${error.message}`, statusCodes.BAD_REQUEST);
    }
    
    return data;
}

async function signIn(email, password) {
    const supabase = connect();
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    
    if (error) {
        throw new CustomError(`Sign in failed: ${error.message}`, statusCodes.UNAUTHORIZED);
    }
    
    return data;
}

async function signOut(jwt) {
    const supabase = connect();
    const { error } = await supabase.auth.signOut();
    
    if (error) {
        throw new CustomError(`Sign out failed: ${error.message}`, statusCodes.INTERNAL_SERVER_ERROR);
    }
    
    return { success: true };
}

async function getUser(jwt) {
    const supabase = connect();
    const { data: { user }, error } = await supabase.auth.getUser(jwt);
    
    if (error) {
        throw new CustomError(`Get user failed: ${error.message}`, statusCodes.UNAUTHORIZED);
    }
    
    return user;
}

module.exports = {
    signUp,
    signIn,
    signOut,
    getUser
};
