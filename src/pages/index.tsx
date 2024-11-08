import { Container, Typography } from '@mui/material'
import { useBlockNumber } from '@starknet-react/core'

const MainPage = () => {
  const { data, error } = useBlockNumber()
  return (
    <Container>
      <Typography>Main Page</Typography>
    </Container>
  )
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/vaults',
      permanent: false,
    },
  }
}

export default MainPage
