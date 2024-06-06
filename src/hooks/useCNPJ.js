import { useEffect, useMemo, useState } from 'react'
import consultarCNPJ from 'consultar-cnpj'

export const regexCNPJ = /^\d{2}.\d{3}.\d{3}\/\d{4}-\d{2}$/

export function validarCNPJ(value = '') {
    if (!value) return false

    const isString = typeof value === 'string'
    const validTypes = isString || Number.isInteger(value) || Array.isArray(value)

    if (!validTypes) return false

    if (isString) {
        const digitsOnly = /^\d{14}$/.test(value)
        const validFormat = regexCNPJ.test(value)
        const isValid = digitsOnly || validFormat

        if (!isValid) return false
    }

    const numbers = matchNumbers(value)

    if (numbers.length !== 14) return false

    const items = [...new Set(numbers)]
    if (items.length === 1) return false

    const digits = numbers.slice(12)

    const digit0 = validCalc(12, numbers)
    if (digit0 !== digits[0]) return false

    const digit1 = validCalc(13, numbers)
    return digit1 === digits[1]
}

export function formatCNPJ(value = '') {
    const valid = validarCNPJ(value)

    if (!valid) return ''

    const numbers = matchNumbers(value)
    const text = numbers.join('')

    const format = text.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        '$1.$2.$3/$4-$5',
    )

    return format
}

function validCalc(x, numbers) {
    const slice = numbers.slice(0, x)
    let factor = x - 7
    let sum = 0

    for (let i = x; i >= 1; i--) {
        const n = slice[x - i]
        sum += n * factor--
        if (factor < 2) factor = 9
    }

    const result = 11 - (sum % 11)

    return result > 9 ? 0 : result
}

function matchNumbers(value = '') {
    const match = value.toString().match(/\d/g)
    return Array.isArray(match) ? match.map(Number) : []
}

function getInscricaoEstadual(empresa) {
    const inscricoes = (empresa?.estabelecimento?.inscricoes_estaduais || [])

    return inscricoes?.filter(inscricao => inscricao?.ativo)[0]?.inscricao_estadual
}


const useCNPJ = (cnpj) => {
    const [tries, setTries] = useState(0)
    const [empresa, setEmpresa] = useState({})

    const isValid = useMemo(() => validarCNPJ(cnpj), [cnpj])

    useEffect(() => {
        (async () => {
            if (tries < 3 && isValid) {
                const result = await consultarCNPJ(cnpj)
                setTries((oldTries) => oldTries + 1)
                setEmpresa(result)
            } else {
                setEmpresa({})
            }
        })()
    }, [cnpj, isValid, tries])

    return empresa?.razao_social ? { razaoSocial: empresa.razao_social, inscricaoEstadual: getInscricaoEstadual(empresa), cnpj: formatCNPJ(cnpj), isValid } : {}
}

export default useCNPJ