import TronWeb from 'tronweb';

// ABI completo del contrato AmigosDeTronComplete
const CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_serviceCompanyAddress", "type": "address"}],
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
      {"indexed": false, "internalType": "uint256", "name": "plan", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "positionId", "type": "uint256"}
    ],
    "name": "MatrixPositionAssigned",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "plan", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "cycleNumber", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "earnings", "type": "uint256"}
    ],
    "name": "MatrixCycleCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "plan", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "planName", "type": "string"}
    ],
    "name": "PlanActivated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "endTime", "type": "uint256"}
    ],
    "name": "PreLaunchActivated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "account", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "plan", "type": "uint256"}
    ],
    "name": "ReinvestmentAccountCreated",
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
    "name": "PLAN_BASIC",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PLAN_MASTER",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PLAN_PREMIUM",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PRE_LAUNCH_DURATION",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "REINVESTMENT_THRESHOLD_LOW",
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
    "inputs": [],
    "name": "activateBasicPlan",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "activateMasterPlan",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "activatePremiumPlan",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "burnTRX",
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
      {"internalType": "uint256", "name": "referralCode", "type": "uint256"},
      {"internalType": "uint256", "name": "registrationTime", "type": "uint256"},
      {"internalType": "bool", "name": "isActive", "type": "bool"},
      {"internalType": "uint256", "name": "totalEarned", "type": "uint256"},
      {"internalType": "uint256", "name": "totalReferrals", "type": "uint256"},
      {"internalType": "bool", "name": "preLaunchActive", "type": "bool"},
      {"internalType": "uint256", "name": "preLaunchEndTime", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_user", "type": "address"},
      {"internalType": "uint256", "name": "_plan", "type": "uint256"}
    ],
    "name": "getUserMatrixInfo",
    "outputs": [
      {"internalType": "uint256", "name": "positionId", "type": "uint256"},
      {"internalType": "address", "name": "upline", "type": "address"},
      {"internalType": "address[]", "name": "children", "type": "address[]"},
      {"internalType": "uint256", "name": "cycles", "type": "uint256"},
      {"internalType": "bool", "name": "isActive", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getGlobalStats",
    "outputs": [
      {"internalType": "uint256", "name": "_totalUsers", "type": "uint256"},
      {"internalType": "uint256", "name": "_totalBurned", "type": "uint256"},
      {"internalType": "uint256", "name": "_reinvestmentBalance", "type": "uint256"},
      {"internalType": "uint256", "name": "_accountsCreated", "type": "uint256"},
      {"internalType": "uint256", "name": "_basicPositions", "type": "uint256"},
      {"internalType": "uint256", "name": "_masterPositions", "type": "uint256"},
      {"internalType": "uint256", "name": "_premiumPositions", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "serviceCompanyAddress",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// IMPORTANTE: Actualizar con la dirección del contrato después del deployment
export const CONTRACT_ADDRESS = 'TBD'; // Cambiar después de deployar

export interface UserInfo {
  userAddress: string;
  sponsor: string;
  referralCode: number;
  registrationTime: number;
  isActive: boolean;
  totalEarned: number;
  totalReferrals: number;
  preLaunchActive: boolean;
  preLaunchEndTime: number;
}

export interface MatrixInfo {
  positionId: number;
  upline: string;
  children: string[];
  cycles: number;
  isActive: boolean;
}

export interface GlobalStats {
  totalUsers: number;
  totalBurned: number;
  reinvestmentBalance: number;
  accountsCreated: number;
  basicPositions: number;
  masterPositions: number;
  premiumPositions: number;
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

  async initContract(): Promise<boolean> {
    try {
      if (!this.tronWeb) {
        throw new Error('TronWeb no disponible');
      }

      if (CONTRACT_ADDRESS === 'TBD') {
        console.warn('⚠️ CONTRACT_ADDRESS no configurado');
        return false;
      }

      this.contract = await this.tronWeb.contract(CONTRACT_ABI, CONTRACT_ADDRESS);
      return true;
    } catch (error) {
      console.error('Error al inicializar contrato:', error);
      return false;
    }
  }

  async register(sponsorCode: number): Promise<{ success: boolean; message: string; txId?: string }> {
    try {
      if (!this.contract) await this.initContract();

      const tx = await (this.contract as { register: (code: number) => { send: (opts: { feeLimit: number }) => Promise<string> } })
        .register(sponsorCode)
        .send({ feeLimit: 100_000_000 });

      return { success: true, message: 'Registro exitoso', txId: tx };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Error al registrar' };
    }
  }

  async activateBasicPlan(): Promise<{ success: boolean; message: string; txId?: string }> {
    try {
      if (!this.contract) await this.initContract();

      const tx = await (this.contract as { activateBasicPlan: () => { send: (opts: { feeLimit: number; callValue: number }) => Promise<string> } })
        .activateBasicPlan()
        .send({ feeLimit: 100_000_000, callValue: 35_000_000 });

      return { success: true, message: 'Plan Básico activado', txId: tx };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Error al activar plan' };
    }
  }

  async activateMasterPlan(): Promise<{ success: boolean; message: string; txId?: string }> {
    try {
      if (!this.contract) await this.initContract();

      const tx = await (this.contract as { activateMasterPlan: () => { send: (opts: { feeLimit: number; callValue: number }) => Promise<string> } })
        .activateMasterPlan()
        .send({ feeLimit: 100_000_000, callValue: 100_000_000 });

      return { success: true, message: 'Plan Master activado', txId: tx };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Error al activar plan' };
    }
  }

  async activatePremiumPlan(): Promise<{ success: boolean; message: string; txId?: string }> {
    try {
      if (!this.contract) await this.initContract();

      const tx = await (this.contract as { activatePremiumPlan: () => { send: (opts: { feeLimit: number; callValue: number }) => Promise<string> } })
        .activatePremiumPlan()
        .send({ feeLimit: 100_000_000, callValue: 250_000_000 });

      return { success: true, message: 'Plan Premium activado', txId: tx };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Error al activar plan' };
    }
  }

  async getUserInfo(address?: string): Promise<UserInfo | null> {
    try {
      if (!this.contract || !this.tronWeb) await this.initContract();
      if (!this.tronWeb) return null;

      const userAddress = address || this.tronWeb.defaultAddress.base58;
      const info = await (this.contract as { getUserInfo: (addr: string) => { call: () => Promise<{
        userAddress: string;
        sponsor: string;
        referralCode: bigint;
        registrationTime: bigint;
        isActive: boolean;
        totalEarned: bigint;
        totalReferrals: bigint;
        preLaunchActive: boolean;
        preLaunchEndTime: bigint;
      }> } }).getUserInfo(userAddress).call();

      return {
        userAddress: this.tronWeb.address.fromHex(info.userAddress),
        sponsor: this.tronWeb.address.fromHex(info.sponsor),
        referralCode: Number(info.referralCode),
        registrationTime: Number(info.registrationTime),
        isActive: info.isActive,
        totalEarned: Number(info.totalEarned) / 1_000_000,
        totalReferrals: Number(info.totalReferrals),
        preLaunchActive: info.preLaunchActive,
        preLaunchEndTime: Number(info.preLaunchEndTime)
      };
    } catch (error) {
      console.error('Error al obtener info de usuario:', error);
      return null;
    }
  }

  async getUserMatrixInfo(address: string, plan: 1 | 2 | 3): Promise<MatrixInfo | null> {
    try {
      if (!this.contract || !this.tronWeb) await this.initContract();
      if (!this.tronWeb) return null;

      const info = await (this.contract as { getUserMatrixInfo: (addr: string, plan: number) => { call: () => Promise<{
        positionId: bigint;
        upline: string;
        children: string[];
        cycles: bigint;
        isActive: boolean;
      }> } }).getUserMatrixInfo(address, plan).call();

      return {
        positionId: Number(info.positionId),
        upline: this.tronWeb.address.fromHex(info.upline),
        children: info.children.map((addr: string) => this.tronWeb!.address.fromHex(addr)),
        cycles: Number(info.cycles),
        isActive: info.isActive
      };
    } catch (error) {
      console.error('Error al obtener info de matriz:', error);
      return null;
    }
  }

  async getGlobalStats(): Promise<GlobalStats | null> {
    try {
      if (!this.contract) await this.initContract();

      const stats = await (this.contract as { getGlobalStats: () => { call: () => Promise<{
        _totalUsers: bigint;
        _totalBurned: bigint;
        _reinvestmentBalance: bigint;
        _accountsCreated: bigint;
        _basicPositions: bigint;
        _masterPositions: bigint;
        _premiumPositions: bigint;
      }> } }).getGlobalStats().call();

      return {
        totalUsers: Number(stats._totalUsers),
        totalBurned: Number(stats._totalBurned) / 1_000_000,
        reinvestmentBalance: Number(stats._reinvestmentBalance) / 1_000_000,
        accountsCreated: Number(stats._accountsCreated),
        basicPositions: Number(stats._basicPositions),
        masterPositions: Number(stats._masterPositions),
        premiumPositions: Number(stats._premiumPositions)
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return null;
    }
  }

  async burnTRX(amount: number): Promise<{ success: boolean; message: string; txId?: string }> {
    try {
      if (!this.contract) await this.initContract();

      const amountInSun = amount * 1_000_000;
      const tx = await (this.contract as { burnTRX: () => { send: (opts: { feeLimit: number; callValue: number }) => Promise<string> } })
        .burnTRX()
        .send({ feeLimit: 100_000_000, callValue: amountInSun });

      return { success: true, message: `${amount} TRX quemados`, txId: tx };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Error al quemar TRX' };
    }
  }
}

export const contractInteraction = new ContractInteraction();