import TronWeb from 'tronweb';

// Configuración de TronWeb
const TRON_NETWORK = {
  fullHost: 'https://api.trongrid.io', // Mainnet
  // fullHost: 'https://api.shasta.trongrid.io', // Testnet
  headers: { 'TRON-PRO-API-KEY': 'your-api-key-here' }, // Opcional pero recomendado
};

// Dirección del contrato (actualizar después del deploy)
export const CONTRACT_ADDRESS = 'TYourContractAddressHere';

// ABI del contrato (versión simplificada con funciones principales)
export const CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "sponsor", "type": "address"}],
    "name": "register",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint8", "name": "plan", "type": "uint8"}],
    "name": "activatePlan",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "title", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "string", "name": "bannerUrl", "type": "string"},
      {"internalType": "string", "name": "targetUrl", "type": "string"},
      {"internalType": "bool", "name": "featured", "type": "bool"}
    ],
    "name": "postAd",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserStats",
    "outputs": [
      {"internalType": "uint256", "name": "registrationTime", "type": "uint256"},
      {"internalType": "uint8", "name": "plan", "type": "uint8"},
      {"internalType": "uint256", "name": "matrixPosition", "type": "uint256"},
      {"internalType": "uint256", "name": "directCommissions", "type": "uint256"},
      {"internalType": "uint256", "name": "cycleCommissions", "type": "uint256"},
      {"internalType": "uint256", "name": "totalEarnings", "type": "uint256"},
      {"internalType": "uint256", "name": "pendingWithdrawal", "type": "uint256"},
      {"internalType": "uint256", "name": "adsPosted", "type": "uint256"},
      {"internalType": "uint256", "name": "preLaunchTimeLeft", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContractStats",
    "outputs": [
      {"internalType": "uint256", "name": "_totalUsers", "type": "uint256"},
      {"internalType": "uint256", "name": "_totalTRXBurned", "type": "uint256"},
      {"internalType": "uint256", "name": "_burnProgress", "type": "uint256"},
      {"internalType": "uint256", "name": "_reinvestmentFund", "type": "uint256"},
      {"internalType": "uint256", "name": "_serviceFund", "type": "uint256"},
      {"internalType": "uint256", "name": "_preLaunchTimeLeft", "type": "uint256"},
      {"internalType": "bool", "name": "_projectActive", "type": "bool"},
      {"internalType": "bool", "name": "_paused", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPreLaunchTimeLeft",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBurnProgress",
    "outputs": [{"internalType": "uint256", "name": "percentage", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "position", "type": "uint256"}],
    "name": "getMatrixDownlines",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserAds",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "adId", "type": "uint256"}],
    "name": "getAd",
    "outputs": [
      {"internalType": "address", "name": "advertiser", "type": "address"},
      {"internalType": "string", "name": "title", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "string", "name": "bannerUrl", "type": "string"},
      {"internalType": "string", "name": "targetUrl", "type": "string"},
      {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
      {"internalType": "bool", "name": "approved", "type": "bool"},
      {"internalType": "bool", "name": "featured", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Inicializar TronWeb
let tronWeb: any = null;

export const initTronWeb = async () => {
  if (typeof window !== 'undefined' && (window as any).tronWeb) {
    // Usar TronLink si está disponible
    tronWeb = (window as any).tronWeb;
    return tronWeb;
  } else {
    // Crear instancia de TronWeb para solo lectura
    tronWeb = new TronWeb(TRON_NETWORK);
    return tronWeb;
  }
};

export const getTronWeb = () => {
  if (!tronWeb) {
    throw new Error('TronWeb not initialized. Call initTronWeb() first.');
  }
  return tronWeb;
};

// Verificar si TronLink está instalado
export const isTronLinkInstalled = (): boolean => {
  return typeof window !== 'undefined' && !!(window as any).tronLink;
};

// Conectar wallet
export const connectWallet = async (): Promise<string | null> => {
  if (!isTronLinkInstalled()) {
    throw new Error('TronLink not installed');
  }

  try {
    const tronLink = (window as any).tronLink;
    
    // Solicitar conexión
    const res = await tronLink.request({ method: 'tron_requestAccounts' });
    
    if (res.code === 200) {
      await initTronWeb();
      const address = tronWeb.defaultAddress.base58;
      return address;
    } else {
      throw new Error('User rejected connection');
    }
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

// Obtener dirección actual
export const getCurrentAddress = async (): Promise<string | null> => {
  try {
    await initTronWeb();
    if (tronWeb && tronWeb.defaultAddress && tronWeb.defaultAddress.base58) {
      return tronWeb.defaultAddress.base58;
    }
    return null;
  } catch (error) {
    console.error('Error getting current address:', error);
    return null;
  }
};

// Obtener balance de TRX
export const getTRXBalance = async (address: string): Promise<number> => {
  try {
    await initTronWeb();
    const balance = await tronWeb.trx.getBalance(address);
    return tronWeb.fromSun(balance);
  } catch (error) {
    console.error('Error getting TRX balance:', error);
    return 0;
  }
};

// Obtener instancia del contrato
export const getContract = async () => {
  try {
    await initTronWeb();
    return await tronWeb.contract(CONTRACT_ABI, CONTRACT_ADDRESS);
  } catch (error) {
    console.error('Error getting contract instance:', error);
    throw error;
  }
};

// Registrar usuario
export const registerUser = async (sponsorAddress: string): Promise<any> => {
  try {
    const contract = await getContract();
    const result = await contract.register(sponsorAddress).send({
      callValue: tronWeb.toSun(35), // 35 TRX
      shouldPollResponse: true,
    });
    return result;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Activar plan
export const activatePlan = async (planId: number): Promise<any> => {
  try {
    const contract = await getContract();
    let amount = 0;
    
    if (planId === 1) amount = 35;
    else if (planId === 2) amount = 100;
    else if (planId === 3) amount = 250;
    
    const result = await contract.activatePlan(planId).send({
      callValue: tronWeb.toSun(amount),
      shouldPollResponse: true,
    });
    return result;
  } catch (error) {
    console.error('Error activating plan:', error);
    throw error;
  }
};

// Retirar fondos
export const withdrawFunds = async (): Promise<any> => {
  try {
    const contract = await getContract();
    const result = await contract.withdraw().send({
      shouldPollResponse: true,
    });
    return result;
  } catch (error) {
    console.error('Error withdrawing funds:', error);
    throw error;
  }
};

// Publicar anuncio
export const postAdvertisement = async (
  title: string,
  description: string,
  bannerUrl: string,
  targetUrl: string,
  featured: boolean,
  adFee: number
): Promise<any> => {
  try {
    const contract = await getContract();
    const result = await contract.postAd(title, description, bannerUrl, targetUrl, featured).send({
      callValue: tronWeb.toSun(adFee),
      shouldPollResponse: true,
    });
    return result;
  } catch (error) {
    console.error('Error posting ad:', error);
    throw error;
  }
};

// Obtener estadísticas del usuario
export const getUserStats = async (address: string): Promise<any> => {
  try {
    const contract = await getContract();
    const stats = await contract.getUserStats(address).call();
    
    return {
      registrationTime: stats.registrationTime.toNumber(),
      plan: stats.plan,
      matrixPosition: stats.matrixPosition.toNumber(),
      directCommissions: tronWeb.fromSun(stats.directCommissions),
      cycleCommissions: tronWeb.fromSun(stats.cycleCommissions),
      totalEarnings: tronWeb.fromSun(stats.totalEarnings),
      pendingWithdrawal: tronWeb.fromSun(stats.pendingWithdrawal),
      adsPosted: stats.adsPosted.toNumber(),
      preLaunchTimeLeft: stats.preLaunchTimeLeft.toNumber(),
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
};

// Obtener estadísticas del contrato
export const getContractStats = async (): Promise<any> => {
  try {
    const contract = await getContract();
    const stats = await contract.getContractStats().call();
    
    return {
      totalUsers: stats._totalUsers.toNumber(),
      totalTRXBurned: tronWeb.fromSun(stats._totalTRXBurned),
      burnProgress: stats._burnProgress.toNumber(),
      reinvestmentFund: tronWeb.fromSun(stats._reinvestmentFund),
      serviceFund: tronWeb.fromSun(stats._serviceFund),
      preLaunchTimeLeft: stats._preLaunchTimeLeft.toNumber(),
      projectActive: stats._projectActive,
      paused: stats._paused,
    };
  } catch (error) {
    console.error('Error getting contract stats:', error);
    throw error;
  }
};

// Obtener downlines de la matriz
export const getMatrixDownlines = async (position: number): Promise<string[]> => {
  try {
    const contract = await getContract();
    const downlines = await contract.getMatrixDownlines(position).call();
    return downlines;
  } catch (error) {
    console.error('Error getting matrix downlines:', error);
    throw error;
  }
};

// Obtener anuncios del usuario
export const getUserAds = async (address: string): Promise<number[]> => {
  try {
    const contract = await getContract();
    const adIds = await contract.getUserAds(address).call();
    return adIds.map((id: any) => id.toNumber());
  } catch (error) {
    console.error('Error getting user ads:', error);
    throw error;
  }
};

// Obtener detalles de un anuncio
export const getAdDetails = async (adId: number): Promise<any> => {
  try {
    const contract = await getContract();
    const ad = await contract.getAd(adId).call();
    
    return {
      advertiser: ad.advertiser,
      title: ad.title,
      description: ad.description,
      bannerUrl: ad.bannerUrl,
      targetUrl: ad.targetUrl,
      timestamp: ad.timestamp.toNumber(),
      approved: ad.approved,
      featured: ad.featured,
    };
  } catch (error) {
    console.error('Error getting ad details:', error);
    throw error;
  }
};

export default {
  initTronWeb,
  getTronWeb,
  isTronLinkInstalled,
  connectWallet,
  getCurrentAddress,
  getTRXBalance,
  getContract,
  registerUser,
  activatePlan,
  withdrawFunds,
  postAdvertisement,
  getUserStats,
  getContractStats,
  getMatrixDownlines,
  getUserAds,
  getAdDetails,
};