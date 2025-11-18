import TronWeb from 'tronweb';

// ABI del contrato actualizado con funciones de dividendos
const CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_serviceCompanyAddress", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "serviceCompanyAddress",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_newAddress", "type": "address"}],
    "name": "updateServiceAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
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
    "name": "claimDividends",
    "outputs": [],
    "stateMutability": "nonpayable",
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
      {"internalType": "bool", "name": "basicActive", "type": "bool"},
      {"internalType": "bool", "name": "masterActive", "type": "bool"},
      {"internalType": "bool", "name": "premiumActive", "type": "bool"},
      {"internalType": "bool", "name": "preLaunchActive", "type": "bool"},
      {"internalType": "uint256", "name": "preLaunchEndTime", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
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
      {"internalType": "uint256", "name": "_gasReserve", "type": "uint256"},
      {"internalType": "uint256", "name": "_renewalFees", "type": "uint256"},
      {"internalType": "uint256", "name": "_accountsCreated", "type": "uint256"},
      {"internalType": "uint256", "name": "_basicCount", "type": "uint256"},
      {"internalType": "uint256", "name": "_masterCount", "type": "uint256"},
      {"internalType": "uint256", "name": "_premiumCount", "type": "uint256"},
      {"internalType": "uint256", "name": "_matrixPositions", "type": "uint256"},
      {"internalType": "uint256", "name": "_dividendPool", "type": "uint256"},
      {"internalType": "uint256", "name": "_totalQualifiedUsers", "type": "uint256"}
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
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "isQualifiedForDividends",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "userAccumulatedDividend",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "dividendPool",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalQualifiedUsers",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export const CONTRACT_ADDRESS = 'TBD';

export interface UserInfo {
  userAddress: string;
  sponsor: string;
  referralCode: number;
  registrationTime: number;
  isActive: boolean;
  totalEarned: number;
  totalReferrals: number;
  basicActive: boolean;
  masterActive: boolean;
  premiumActive: boolean;
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
  gasReserve: number;
  renewalFees: number;
  accountsCreated: number;
  basicCount: number;
  masterCount: number;
  premiumCount: number;
  matrixPositions: number;
  dividendPool: number;
  totalQualifiedUsers: number;
}

export interface DividendInfo {
  accumulatedDividend: string;
  isQualified: boolean;
  dividendPool: string;
  totalQualifiedUsers: number;
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

  async getOwner(): Promise<string | null> {
    try {
      if (!this.contract) await this.initContract();
      const owner = await (this.contract as { owner: () => { call: () => Promise<string> } }).owner().call();
      return this.tronWeb!.address.fromHex(owner);
    } catch (error) {
      console.error('Error al obtener owner:', error);
      return null;
    }
  }

  async getServiceAddress(): Promise<string | null> {
    try {
      if (!this.contract) await this.initContract();
      const addr = await (this.contract as { serviceCompanyAddress: () => { call: () => Promise<string> } }).serviceCompanyAddress().call();
      return this.tronWeb!.address.fromHex(addr);
    } catch (error) {
      console.error('Error al obtener service address:', error);
      return null;
    }
  }

  async updateServiceAddress(newAddress: string): Promise<{ success: boolean; message: string; txId?: string }> {
    try {
      if (!this.contract) await this.initContract();

      const tx = await (this.contract as { updateServiceAddress: (addr: string) => { send: (opts: { feeLimit: number }) => Promise<string> } })
        .updateServiceAddress(newAddress)
        .send({ feeLimit: 100_000_000 });

      return { success: true, message: 'Dirección actualizada', txId: tx };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Error al actualizar' };
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

  async claimDividends(address: string): Promise<{ success: boolean; message?: string; amount?: string; error?: string; txId?: string }> {
    try {
      if (!this.contract) await this.initContract();

      // Obtener el monto acumulado antes del claim
      const accumulatedAmount = await (this.contract as { userAccumulatedDividend: (addr: string) => { call: () => Promise<bigint> } })
        .userAccumulatedDividend(address).call();

      const amountInTRX = (Number(accumulatedAmount) / 1_000_000).toFixed(2);

      const tx = await (this.contract as { claimDividends: () => { send: (opts: { feeLimit: number }) => Promise<string> } })
        .claimDividends()
        .send({ feeLimit: 100_000_000 });

      return { 
        success: true, 
        message: 'Dividendos reclamados exitosamente', 
        amount: amountInTRX,
        txId: tx 
      };
    } catch (error) {
      console.error('Error al reclamar dividendos:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al reclamar dividendos' 
      };
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
        basicActive: boolean;
        masterActive: boolean;
        premiumActive: boolean;
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
        basicActive: info.basicActive,
        masterActive: info.masterActive,
        premiumActive: info.premiumActive,
        preLaunchActive: info.preLaunchActive,
        preLaunchEndTime: Number(info.preLaunchEndTime)
      };
    } catch (error) {
      console.error('Error al obtener info de usuario:', error);
      return null;
    }
  }

  async getUserMatrixInfo(address: string): Promise<MatrixInfo | null> {
    try {
      if (!this.contract || !this.tronWeb) await this.initContract();
      if (!this.tronWeb) return null;

      const info = await (this.contract as { getUserMatrixInfo: (addr: string) => { call: () => Promise<{
        positionId: bigint;
        upline: string;
        children: string[];
        cycles: bigint;
        isActive: boolean;
      }> } }).getUserMatrixInfo(address).call();

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
        _gasReserve: bigint;
        _renewalFees: bigint;
        _accountsCreated: bigint;
        _basicCount: bigint;
        _masterCount: bigint;
        _premiumCount: bigint;
        _matrixPositions: bigint;
        _dividendPool: bigint;
        _totalQualifiedUsers: bigint;
      }> } }).getGlobalStats().call();

      return {
        totalUsers: Number(stats._totalUsers),
        totalBurned: Number(stats._totalBurned) / 1_000_000,
        reinvestmentBalance: Number(stats._reinvestmentBalance) / 1_000_000,
        gasReserve: Number(stats._gasReserve) / 1_000_000,
        renewalFees: Number(stats._renewalFees) / 1_000_000,
        accountsCreated: Number(stats._accountsCreated),
        basicCount: Number(stats._basicCount),
        masterCount: Number(stats._masterCount),
        premiumCount: Number(stats._premiumCount),
        matrixPositions: Number(stats._matrixPositions),
        dividendPool: Number(stats._dividendPool) / 1_000_000,
        totalQualifiedUsers: Number(stats._totalQualifiedUsers)
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return null;
    }
  }

  async getUserDividendInfo(address: string): Promise<DividendInfo> {
    try {
      if (!this.contract || !this.tronWeb) await this.initContract();
      if (!this.tronWeb) {
        return {
          accumulatedDividend: '0',
          isQualified: false,
          dividendPool: '0',
          totalQualifiedUsers: 0
        };
      }

      // Obtener dividendo acumulado del usuario
      const accumulated = await (this.contract as { userAccumulatedDividend: (addr: string) => { call: () => Promise<bigint> } })
        .userAccumulatedDividend(address).call();

      // Verificar si está calificado
      const qualified = await (this.contract as { isQualifiedForDividends: (addr: string) => { call: () => Promise<boolean> } })
        .isQualifiedForDividends(address).call();

      // Obtener pool global
      const pool = await (this.contract as { dividendPool: () => { call: () => Promise<bigint> } })
        .dividendPool().call();

      // Obtener total de usuarios calificados
      const totalQualified = await (this.contract as { totalQualifiedUsers: () => { call: () => Promise<bigint> } })
        .totalQualifiedUsers().call();

      return {
        accumulatedDividend: (Number(accumulated) / 1_000_000).toFixed(2),
        isQualified: qualified,
        dividendPool: (Number(pool) / 1_000_000).toFixed(2),
        totalQualifiedUsers: Number(totalQualified)
      };
    } catch (error) {
      console.error('Error al obtener información de dividendos:', error);
      return {
        accumulatedDividend: '0',
        isQualified: false,
        dividendPool: '0',
        totalQualifiedUsers: 0
      };
    }
  }

  async getUserReferrals(address: string): Promise<string[]> {
    try {
      if (!this.contract || !this.tronWeb) await this.initContract();
      if (!this.tronWeb) return [];

      const referrals = await (this.contract as { getUserReferrals: (addr: string) => { call: () => Promise<string[]> } })
        .getUserReferrals(address).call();

      return referrals.map((addr: string) => this.tronWeb!.address.fromHex(addr));
    } catch (error) {
      console.error('Error al obtener referidos:', error);
      return [];
    }
  }
}

export const contractInteraction = new ContractInteraction();