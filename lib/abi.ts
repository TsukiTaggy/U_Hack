import { parseAbi } from "viem";

// Minimal ABIs for contracts/SafeStart.sol (only the functions the app uses).

export const testUsdcAbi = parseAbi([
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 value) returns (bool)",
  "function transfer(address to, uint256 value) returns (bool)",
  "function mint(address to, uint256 amount)",
]);

export const fakeAirdropAbi = parseAbi([
  "function drain(address victim)",
  "event Drained(address indexed victim, uint256 amount)",
]);

export const certAbi = parseAbi([
  "function balanceOf(address owner) view returns (uint256)",
  "function mint(address to, uint8 level) returns (uint256)",
  "function nextId() view returns (uint256)",
  "function levelOf(uint256 tokenId) view returns (uint8)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
]);
