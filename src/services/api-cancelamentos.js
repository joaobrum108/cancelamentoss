import { api_cancelamentos } from "./api";

export const relatorioCancelamentos = () => {
    return api_cancelamentos.get('/cancellations');
}

export const analiseBairro = () => {
    return api_cancelamentos.get('/v1/cancellations/analytics/by-neighborhood');
}

export const analiseData = () => {
    return api_cancelamentos.get('/v1/cancellations/analytics/by-date');
}

export const analiseMes = () => {
    return api_cancelamentos.get('/v1/cancellations/analytics/by-period');
}

export const analiseTaxaCancelamento = () => {
    return api_cancelamentos.get('/v1/cancellations/analytics/cancellation-rate');
}


