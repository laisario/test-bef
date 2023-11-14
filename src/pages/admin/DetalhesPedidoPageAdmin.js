import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Chip, Container, Grid, Link, Paper, Stack, TextField, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import { Helmet } from 'react-helmet-async';

import { useTheme } from '@emotion/react';
import useOrders from '../../hooks/useOrders';
import CardInformation from '../../components/orders/CardInformation';
import Iconify from '../../components/iconify';
import { capitalizeFirstLetter as CFL } from '../../utils/formatString';
import { fDateTime } from '../../utils/formatTime';
import FormEditProposta from '../../components/admin/FormEditOrder';

const formaPagamento = {
  CD: 'Débito',
  CC: 'Crédito',
  P: 'Pix',
  D: 'Dinheiro',
};

const aprovacaoProposta = {
  null: 'Proposta em análise',
  false: 'Proposta negada',
  true: 'Proposta aprovada',
};

const colorAprovacaoProposta = {
  null: 'info',
  false: 'error',
  true: 'success',
};

function DetalhesPedidoPageAdmin() {
  const [edit, setEdit] = useState(false);
  const { id } = useParams();
  const { data, deleteOrder} = useOrders(id);
  const theme = useTheme();
  return (
    <>
      <Helmet>
        <title> Pedido | B&F </title>
      </Helmet>
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Box direction="column">
            <Typography variant="h4" gutterBottom>
              Pedido número: {data?.numero}
            </Typography>
            <Typography variant="h6" gutterBottom>
              {fDateTime(data?.data_criacao)}
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button onClick={deleteOrder} color="secondary">
              <Iconify icon="eva:trash-2-fill" />
            </Button>
            {data?.status !== 'F' ? (
              <Button variant="contained" onClick={() => setEdit(true)} endIcon={<Iconify icon="eva:checkmark-fill" />}>
                Finalizar proposta
              </Button>
            ) : (
              <Button variant="contained" onClick={() => setEdit(true)} endIcon={<Iconify icon="eva:edit-fill" />}>
                Editar proposta
              </Button>
            )}
          </Box>
        </Stack>

        {!!data && <FormEditProposta open={edit} data={data} handleClose={() => setEdit(false)} />}
        <Paper sx={{ padding: 4 }}>
          <Grid container flexDirection="row" justifyContent="space-between">
            <Box>
              <Typography variant="h6">Total: R${data?.total}</Typography>
              <Typography variant="OVERLINE TEXT" marginY="2px" fontWeight="500">
                Local calibração: {data?.local === 'L' ? 'Laboratório B&F' : 'Cliente'}
              </Typography>
              <Typography variant="subtitle1" fontWeight="500">
                Forma de pagamento: {formaPagamento[data?.condicao_de_pagamento]}
              </Typography>
              <Typography variant="subtitle1" fontWeight="500">
                Transporte: {CFL(data?.transporte)}
              </Typography>
              <Typography variant="subtitle1" fontWeight="500">
                Endereço de entrega: {data?.endereco_de_entrega?.logradouro} {data?.endereco_de_entrega?.numero}{' '}
                {data?.endereco_de_entrega?.bairro}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" gap={1}>
              <Chip
                label={aprovacaoProposta[data?.aprovacao]}
                color={colorAprovacaoProposta[data?.aprovacao]}
                variant="outlined"
              />
            </Box>
          </Grid>
          <Typography variant="h6" my={2}>
            Instrumentos
          </Typography>
          <Box display="flex" gap={3} sx={{ overflowX: 'auto' }} width="100%">
            {data?.instrumentos?.map(
              (
                {
                  tag,
                  numero_de_serie: numeroDeSerie,
                  posicao,
                  data_ultima_calibracao: dataUltimaCalibracao,
                  status: { nome },
                  instrumento: {
                    maximo,
                    minimo,
                    unidade,
                    capacidade_de_medicao: { valor, unidade: unidadeMedicao },
                    tipo_de_instrumento: { descricao },
                  },
                  id,
                },
                index
              ) => (
                <CardInformation
                  instrumento={{
                    tag,
                    numero_de_serie: numeroDeSerie,
                    data_ultima_calibracao: dataUltimaCalibracao,
                    status: nome,
                    informacoes_adicionais: data.informacoes_adicionais,
                    local: data.local,
                    maximo,
                    minimo,
                    unidade,
                    valor,
                    unidadeMedicao,
                    posicao,
                    descricao,
                    id
                  }}
                  key={index}
                  specialCases={{ numero_de_serie: 'Número de série', data_ultima_calibracao: 'Última Calibração', informacoes_adicionais: 'Informações adicionais' }}
                  titles={['tag', 'numero_de_serie', 'data_ultima_calibracao', 'status', 'informacoes_adicionais']}
                  proposta={data}
                />
              )
            )}
          </Box>
          {!!data?.informacoes_adicionais && (
            <>
              <Typography my={2} variant="h6">
                Informações Adicionais
              </Typography>
              <Card sx={{ padding: 2, my: 2, backgroundColor: theme.palette.background.neutral }}>
                <Typography>{data?.informacoes_adicionais}</Typography>
              </Card>
            </>
          )}
        </Paper>
      </Container>
    </>
  );
}

export default DetalhesPedidoPageAdmin;
