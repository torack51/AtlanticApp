export const translateStatus = (status: string): string => {
    switch (status) {
        case 'live':
            return 'En cours';
        case 'completed':
            return 'Terminé';
        case 'upcoming':
            return 'À venir';
        case 'cancelled':
            return 'Annulé';
        case 'postponed':
            return 'Reporté';
        default:
            return status;
    }
};