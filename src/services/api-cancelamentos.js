import { api_cancelamentos } from "./api";

// esse ja foi usado na listagem relatorios
export const relatorioCancelamentos = () => {
    return api_cancelamentos.get('/cancellations');
}

export const analiseBairro = () => {
    return api_cancelamentos.get('/v1/cancellations/analytics/by-neighborhood');
}

export const analiseData = () => {
    return api_cancelamentos.get('/v1/cancellations/analytics/by-date');
}

// esse ja foi usado no grafico pequeno principal
export const analiseMes = () => {
    return api_cancelamentos.get('/v1/cancellations/analytics/by-period');
}

// esse ja foi usado no grafico de barras
export const analiseTaxaCancelamento = () => {
    return api_cancelamentos.get('/v1/cancellations/analytics/cancellation-rate');
}


