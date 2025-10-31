import { supabaseClient, isSupabaseEnabled, currentUser, loadUserProfile } from "./supabase.js";
import { loadUserProgress } from './progress.js';
import { showPage } from "../app/navigation.js";

export function showWelcomeModal() {
    if (!isSupabaseEnabled) return;
    const modal = document.getElementById('welcomeModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('show');
    }
}

export function closeWelcomeModal() {
    const modal = document.getElementById('welcomeModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }
}

export function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }
    clearAuthMessage();
}

export function updateUIForAuthenticatedUser() {
    const signInBtn = document.getElementById('signInBtn');
    const userProfileHeader = document.getElementById('userProfileHeader');
    const userNameHeader = document.getElementById('userNameHeader');
    
    if (signInBtn) signInBtn.style.display = 'none';
    if (userProfileHeader) userProfileHeader.style.display = 'flex';
    if (userNameHeader) {
        userNameHeader.textContent = currentUser.displayName || currentUser.email.split('@')[0];
    }
}

export function updateUIForGuestUser() {
    const signInBtn = document.getElementById('signInBtn');
    const userProfileHeader = document.getElementById('userProfileHeader');
    
    if (signInBtn) signInBtn.style.display = 'block';
    if (userProfileHeader) userProfileHeader.style.display = 'none';
}

export async function signIn() {
    if (!isSupabaseEnabled) return;
    const email = document.getElementById('signInEmail').value.trim();
    const password = document.getElementById('signInPassword').value;
    
    if (!email || !password) {
        showAuthMessage('Mohon isi email dan password', 'error');
        return;
    }
    
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        currentUser = data.user;
        await loadUserProfile();
        showAuthMessage('Sign in berhasil!', 'success');
        
        setTimeout(() => {
            closeAuthModal();
            updateUIForAuthenticatedUser();
            loadUserProgress();
        }, 1500);
    } catch (error) {
        showAuthMessage(error.message, 'error');
    }
}

export async function signUp() {
    if (!isSupabaseEnabled) return;
    const name = document.getElementById('signUpName').value.trim();
    const email = document.getElementById('signUpEmail').value.trim();
    const password = document.getElementById('signUpPassword').value;
    
    if (!name || !email || !password) {
        showAuthMessage('Mohon isi semua field', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAuthMessage('Password minimal 6 karakter', 'error');
        return;
    }
    
    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: { data: { full_name: name } }
        });
        
        if (error) throw error;
        
        if (data.user) {
            await supabaseClient.from('user_profiles').insert([{
                user_id: data.user.id,
                display_name: name
            }]);
            
            await supabaseClient.from('user_progress').insert([{
                user_id: data.user.id,
                completed_modules: [],
                chapter_scores: {},
                drag_drop_stats: { attempts: 0, correct: 0 }
            }]);
        }
        
        if (data.user) {
            closeAuthModal();
            alert(`✅ Pendaftaran Berhasil!\n\n📧 Kami telah mengirim email konfirmasi ke:\n${email}\n\nSilakan buka email Anda dan klik link konfirmasi sebelum Sign In.\n\n⚠️ Cek folder Spam jika tidak ada di Inbox.`);
        }
    } catch (error) {
        showAuthMessage(error.message, 'error');
    }
}

export async function signOut() {
    if (!isSupabaseEnabled) return;
    try {
        await supabaseClient.auth.signOut();
        currentUser = null;
        updateUIForGuestUser();
        showPage('home');
        alert('Sign out berhasil!');
    } catch (error) {
        console.error('Sign out error:', error);
    }
}

export function showAuthModal(type) {
    if (!isSupabaseEnabled) {
        alert('Fitur autentikasi belum dikonfigurasi.');
        return;
    }
    closeWelcomeModal();
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('show');
    }
    switchAuthForm(type);
}

export function switchAuthForm(type) {
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    
    if (type === 'signin') {
        signInForm.style.display = 'block';
        signUpForm.style.display = 'none';
    } else {
        signInForm.style.display = 'none';
        signUpForm.style.display = 'block';
    }
    clearAuthMessage();
}

export async function signInWithGoogle() {
    if (!isSupabaseEnabled) {
        alert('Fitur autentikasi belum dikonfigurasi.');
        return;
    }
    
    try {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        
        if (error) throw error;
        
    } catch (error) {
        console.error('Google Sign In error:', error);
        showAuthMessage('Gagal sign in dengan Google: ' + error.message, 'error');
    }
}

function showAuthMessage(message, type) {
    const messageDiv = document.getElementById('authMessage');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `auth-message show ${type}`;
    }
}

function clearAuthMessage() {
    const messageDiv = document.getElementById('authMessage');
    if (messageDiv) {
        messageDiv.className = 'auth-message';
        messageDiv.textContent = '';
    }
}