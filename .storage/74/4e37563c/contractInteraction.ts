import TronWeb from 'tronweb';

// ABI del contrato AmigosDeTron
const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "from", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "to", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "commissionType", "type": "string"}
    ],
    "name": "CommissionPaid",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "upline", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "level", "type": "uint256"}
    ],
    "name": "MatrixPositionAssigned",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "plan", "type": "uint256"}
    ],
    "name": "PlanPurchased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "totalBurned", "type": "uint256"}
    ],
    "name": "TRXBurned",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "sponsor", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "referralCode", "type": "uint256"}
    ],
    "name": "UserRegistered",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "BURN_ADDRESS",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PLAN_50",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PLAN_100",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PLAN_500",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_sponsorCode", "type": "uint256"}],
    "name": "register",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_plan", "type": "uint256"}],
    "name": "purchasePlan",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserInfo",
    "outputs": [
      {"internalType": "address", "name": "userAddress", "type": "address"},
      {"internalType": "address", "name": "sponsor", "type": "address"},
      {"internalType": "address", "name": "upline", "type": "address"},
      {"internalType": "uint256", "name": "referralCode", "type": "uint256"},
      {"internalType": "uint256", "name": "totalInvested", "type": "uint256"},
      {"internalType": "uint256", "name": "totalEarned", "type": "uint256"},
      {"internalType": "uint256", "name": "totalReferrals", "type": "uint256"},
      {"internalType": "uint256", "name": "matrixLevel", "type": "uint256"},
      {"internalType": "bool", "name": "isActive", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserTransactions",
    "outputs": [
      {
        "components": [
          {"internalType": "address", "name": "user", "type": "address"},
          {"internalType": "uint256", "name": "amount", "type": "uint256"},
          {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
          {"internalType": "string", "name": "transactionType", "type": "string"},
          {"internalType": "address", "name": "relatedAddress", "type": "address"}
        ],
        "internalType": "struct AmigosDeTron.Transaction[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserReferrals",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getGlobalStats",
    "outputs": [
      {"internalType": "uint256", "name": "_totalUsers", "type": "uint256"},
      {"internalType": "uint256", "name": "_totalInvested", "type": "uint256"},
      {"internalType": "uint256", "name": "_totalBurned", "type": "uint256"},
      {"internalType": "uint256", "name": "_burnPercentage", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "isUserRegistered",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_code", "type": "uint256"}],
    "name": "getAddressByReferralCode",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Dirección del contrato (actualizar después del deployment)
// IMPORTANTE: Cambiar esta dirección después de deployar el contrato
export const CONTRACT_ADDRESS = 'TBD'; // Actualizar con la dirección real del contrato

export interface UserInfo {
  userAddress: string;
  sponsor: string;
  upline: string;
  referralCode: number;
  totalInvested: number;
  totalEarned: number;
  totalReferrals: number;
  matrixLevel: number;
  isActive: boolean;
}

export interface Transaction {
  user: string;
  amount: number;
  timestamp: number;
  transactionType: string;
  relatedAddress: string;
}

export interface GlobalStats {
  totalUsers: number;
  totalInvested: number;
  totalBurned: number;
  burnPercentage: number;
}

interface ContractUserInfo {
  userAddress: string;
  sponsor: string;
  upline: string;
  referralCode: bigint;
  totalInvested: bigint;
  totalEarned: bigint;
  totalReferrals: bigint;
  matrixLevel: bigint;
  isActive: boolean;
}

interface ContractTransaction {
  user: string;
  amount: bigint;
  timestamp: bigint;
  transactionType: string;
  relatedAddress: string;
}

interface ContractStats {
  _totalUsers: bigint;
  _totalInvested: bigint;
  _totalBurned: bigint;
  _burnPercentage: bigint;
}

class ContractInteraction {
  private tronWeb: TronWeb | null;
  private contract: unknown;

  constructor() {
    if (typeof window !== 'undefined' && (window as unknown as { tronWeb?: TronWeb }).tronWeb) {
      this.tronWeb = (window as unknown as { tronWeb: TronWeb }).tronWeb;
    } else {
      this.tronWeb = null;
    }
  }

  /**
   * Inicializa el contrato
   */
  async initContract(): Promise<boolean> {
    try {
      if (!this.tronWeb) {
        throw new Error('TronWeb no está disponible');
      }

      if (CONTRACT_ADDRESS === 'TBD') {
        console.warn('⚠️ Dirección del contrato no configurada. Actualiza CONTRACT_ADDRESS en contractInteraction.ts');
        return false;
      }

      this.contract = await this.tronWeb.contract(CONTRACT_ABI, CONTRACT_ADDRESS);
      return true;
    } catch (error) {
      console.error('Error al inicializar contrato:', error);
      return false;
    }
  }

  /**
   * Registra un nuevo usuario con código de referido
   */
  async register(sponsorCode: number): Promise<{ success: boolean; message: string; txId?: string }> {
    try {
      if (!this.contract) {
        await this.initContract();
      }

      const tx = await (this.contract as { register: (code: number) => { send: (opts: { feeLimit: number; callValue: number }) => Promise<string> } }).register(sponsorCode).send({
        feeLimit: 100_000_000,
        callValue: 0
      });

      return {
        success: true,
        message: 'Registro exitoso',
        txId: tx
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al registrar usuario';
      console.error('Error al registrar usuario:', error);
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  /**
   * Compra un plan
   */
  async purchasePlan(plan: 50 | 100 | 500): Promise<{ success: boolean; message: string; txId?: string }> {
    try {
      if (!this.contract) {
        await this.initContract();
      }

      const planAmount = plan * 1_000_000; // Convertir a SUN (6 decimales)

      const tx = await (this.contract as { purchasePlan: (amount: number) => { send: (opts: { feeLimit: number; callValue: number }) => Promise<string> } }).purchasePlan(planAmount).send({
        feeLimit: 100_000_000,
        callValue: planAmount
      });

      return {
        success: true,
        message: `Plan de ${plan} TRX comprado exitosamente`,
        txId: tx
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al comprar plan';
      console.error('Error al comprar plan:', error);
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  /**
   * Obtiene información del usuario
   */
  async getUserInfo(address?: string): Promise<UserInfo | null> {
    try {
      if (!this.contract || !this.tronWeb) {
        await this.initContract();
      }

      if (!this.tronWeb) {
        return null;
      }

      const userAddress = address || this.tronWeb.defaultAddress.base58;
      const info = await (this.contract as { getUserInfo: (addr: string) => { call: () => Promise<ContractUserInfo> } }).getUserInfo(userAddress).call();

      return {
        userAddress: this.tronWeb.address.fromHex(info.userAddress),
        sponsor: this.tronWeb.address.fromHex(info.sponsor),
        upline: this.tronWeb.address.fromHex(info.upline),
        referralCode: Number(info.referralCode),
        totalInvested: Number(info.totalInvested) / 1_000_000,
        totalEarned: Number(info.totalEarned) / 1_000_000,
        totalReferrals: Number(info.totalReferrals),
        matrixLevel: Number(info.matrixLevel),
        isActive: info.isActive
      };
    } catch (error) {
      console.error('Error al obtener información del usuario:', error);
      return null;
    }
  }

  /**
   * Obtiene transacciones del usuario
   */
  async getUserTransactions(address?: string): Promise<Transaction[]> {
    try {
      if (!this.contract || !this.tronWeb) {
        await this.initContract();
      }

      if (!this.tronWeb) {
        return [];
      }

      const userAddress = address || this.tronWeb.defaultAddress.base58;
      const transactions = await (this.contract as { getUserTransactions: (addr: string) => { call: () => Promise<ContractTransaction[]> } }).getUserTransactions(userAddress).call();

      return transactions.map((tx: ContractTransaction) => ({
        user: this.tronWeb!.address.fromHex(tx.user),
        amount: Number(tx.amount) / 1_000_000,
        timestamp: Number(tx.timestamp),
        transactionType: tx.transactionType,
        relatedAddress: this.tronWeb!.address.fromHex(tx.relatedAddress)
      }));
    } catch (error) {
      console.error('Error al obtener transacciones:', error);
      return [];
    }
  }

  /**
   * Obtiene referidos del usuario
   */
  async getUserReferrals(address?: string): Promise<string[]> {
    try {
      if (!this.contract || !this.tronWeb) {
        await this.initContract();
      }

      if (!this.tronWeb) {
        return [];
      }

      const userAddress = address || this.tronWeb.defaultAddress.base58;
      const referrals = await (this.contract as { getUserReferrals: (addr: string) => { call: () => Promise<string[]> } }).getUserReferrals(userAddress).call();

      return referrals.map((addr: string) => this.tronWeb!.address.fromHex(addr));
    } catch (error) {
      console.error('Error al obtener referidos:', error);
      return [];
    }
  }

  /**
   * Obtiene estadísticas globales
   */
  async getGlobalStats(): Promise<GlobalStats | null> {
    try {
      if (!this.contract) {
        await this.initContract();
      }

      const stats = await (this.contract as { getGlobalStats: () => { call: () => Promise<ContractStats> } }).getGlobalStats().call();

      return {
        totalUsers: Number(stats._totalUsers),
        totalInvested: Number(stats._totalInvested) / 1_000_000,
        totalBurned: Number(stats._totalBurned) / 1_000_000,
        burnPercentage: Number(stats._burnPercentage)
      };
    } catch (error) {
      console.error('Error al obtener estadísticas globales:', error);
      return null;
    }
  }

  /**
   * Verifica si un usuario está registrado
   */
  async isUserRegistered(address?: string): Promise<boolean> {
    try {
      if (!this.contract || !this.tronWeb) {
        await this.initContract();
      }

      if (!this.tronWeb) {
        return false;
      }

      const userAddress = address || this.tronWeb.defaultAddress.base58;
      return await (this.contract as { isUserRegistered: (addr: string) => { call: () => Promise<boolean> } }).isUserRegistered(userAddress).call();
    } catch (error) {
      console.error('Error al verificar registro:', error);
      return false;
    }
  }

  /**
   * Obtiene dirección por código de referido
   */
  async getAddressByReferralCode(code: number): Promise<string | null> {
    try {
      if (!this.contract || !this.tronWeb) {
        await this.initContract();
      }

      if (!this.tronWeb) {
        return null;
      }

      const address = await (this.contract as { getAddressByReferralCode: (code: number) => { call: () => Promise<string> } }).getAddressByReferralCode(code).call();
      return this.tronWeb.address.fromHex(address);
    } catch (error) {
      console.error('Error al obtener dirección por código:', error);
      return null;
    }
  }
}

export const contractInteraction = new ContractInteraction();