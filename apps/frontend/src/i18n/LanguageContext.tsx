import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'it' | 'en';

const translations = {
    it: {
        dashboardTitle: 'Le Mie Liste Regali',
        myLists: 'Create da Me',
        invitedLists: 'Liste a cui partecipo',
        logout: 'Esci',
        createNewList: 'Crea Nuova Lista',
        loading: 'Caricamento liste...',
        giftsCount: 'Regali',
        manage: 'Gestisci',
        view: 'Vai alla Lista',
        noListsTitle: 'Nessuna lista',
        noListsMsg: 'Non hai ancora creato nessuna lista regali.',
        createFirstList: 'Crea la tua prima lista',
        joinListTitle: 'Vuoi partecipare a una lista?',
        joinListInput: "Incolla il link della lista o l'ID",
        joinListButton: 'Partecipa',
        joinListError: "Errore durante l'accesso. Controlla il link rirpova.",
        backToDashboard: 'Torna alla Dashboard',
        editListLocalName: 'Rinomina lista',
        save: 'Salva',
        landingTitle: 'Giftlyst - La tua Lista Regali Online Gratuita',
        landingSubtitle: 'Crea la tua lista dei desideri perfetta per ogni occasione (compleanni, matrimoni, nascite). Condividila facilmente con amici e parenti e gestisci i regali mantenendo l\'effetto sorpresa.',
        welcomeBack: 'Bentornato',
        createAccount: 'Crea un account',
        loginButton: 'Accedi',
        registerButton: 'Registrati',
        emailLabel: 'Email',
        passwordLabel: 'Password',
        nameLabel: 'Nome',
        noAccount: 'Non hai un account?',
        createOne: 'Creane uno',
        alreadyHaveAccount: 'Hai già un account?',
        loginNow: 'Accedi ora',
        languageIT: 'IT',
        languageEN: 'EN'
    },
    en: {
        dashboardTitle: 'My Gift Lists',
        myLists: 'Created by Me',
        invitedLists: 'Lists I Joined',
        logout: 'Logout',
        createNewList: 'Create New List',
        loading: 'Loading lists...',
        giftsCount: 'Gifts',
        manage: 'Manage',
        view: 'View List',
        noListsTitle: 'No lists',
        noListsMsg: "You haven't created any gift lists yet.",
        createFirstList: 'Create your first list',
        joinListTitle: 'Want to join a list?',
        joinListInput: 'Paste the list link or ID',
        joinListButton: 'Join',
        joinListError: 'Failed to join. Please check the link and try again.',
        backToDashboard: 'Back to Dashboard',
        editListLocalName: 'Rename list',
        save: 'Save',
        landingTitle: 'Giftlyst - Your Free Online Sharable Wishlist',
        landingSubtitle: 'Create your perfect wishlist for any occasion (birthdays, weddings, baby showers). Share it easily with friends and family while keeping the surprise effect.',
        welcomeBack: 'Welcome Back',
        createAccount: 'Create an Account',
        loginButton: 'Login',
        registerButton: 'Register',
        emailLabel: 'Email',
        passwordLabel: 'Password',
        nameLabel: 'Name',
        noAccount: "Don't have an account?",
        createOne: 'Create one',
        alreadyHaveAccount: 'Already have an account?',
        loginNow: 'Login now',
        languageIT: 'IT',
        languageEN: 'EN'
    }
};

type Translations = typeof translations.it;

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof Translations) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => {
        const saved = localStorage.getItem('appLanguage');
        if (saved === 'it' || saved === 'en') return saved;
        return navigator.language.startsWith('it') ? 'it' : 'en';
    });

    useEffect(() => {
        localStorage.setItem('appLanguage', language);
    }, [language]);

    const t = (key: keyof Translations) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
