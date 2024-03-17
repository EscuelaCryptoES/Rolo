# Rolo

Rolo is a **trustless off-ramp automating protocol** which revolutionizes the way people transact in the digital age. Our fast, secure, and transparent off-ramp solution allows users to auto-swap between crypto and fiat currencies and transfers directly into their gnosis pay account.

## Key Features

- **Trustless Transactions**: Rolo provides a secure environment for transactions without the need for a trusted third party.
- **Auto-Swap**: Automatically swap between crypto and fiat currencies.
- **Direct Fiat Transfers**: Seamlessly transfer funds directly to your gnosis pay account.

## Code Architecture

Upon user login, our system utilizes a combination of technologies and custom modules to ensure a seamless onboarding experience and to facilitate secure transactions:

1. **Seamless Onboarding UX**: We use [Tenderly](https://tenderly.co/) to provide a seamless onboarding user experience.
2. **Safe Smart Accounts Creation**: With [Pimlico](https://pimlico.example.com), we create Safe smart accounts for our users.
3. **Initialization and Token Swapping**:
    - We initialize the smart account by adding a custom module (`SwapModule`) designed for token swapping.
    - For the swap of two tokens on `Balancer V2`, we employ a custom function (`executeSimpleSwap`).
4. **Transaction Detection**:
    - Transaction detection is managed through Tenderly, using a event hook that listens for entry token transfer events to the Safe address.
5. **Fund Transfer**:
    - After the swap on Balancer V2, funds (EURe) are transferred to a Gnosis Pay address, making them available for the user.

## Figma Designs

For a visual representation of our UI/UX design, check out our [Figma designs](https://www.figma.com/file/LM1a2TWqdpJZESPBCGKcNe/ROLO).
