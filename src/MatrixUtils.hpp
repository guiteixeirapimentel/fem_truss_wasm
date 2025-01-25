#pragma once
#include "Matrix.hpp"

template <typename T>
constexpr T absVal(const T v)
{
    if (v > T{ 0 })
    {
        return v;
    }

    return -v;
}

#ifdef WASM

static unsigned long int next = 1;

static constexpr int RAND_MAX = 32767;
extern "C"
{
    int rand() // RAND_MAX assumed to be 32767
    {
        next = next * 1103515245 + 12345;
        return (unsigned int)(next / 65536) % 32768;
    }

    void srand(unsigned int seed)
    {
        next = seed;
    }

    double cos(double angle);

    double sin(double angle);

    double acos(double val);

    double sqrt(double val);
    double tan(double val);
    double atan2(double a, double b);
}

#else
#include <cmath>
#endif

using Matriz = Matrix<double>;

Matriz CriaMatrizAleatoria(std::size_t numlinhas, std::size_t numColunas);

Matriz SubstSucessivas(const Matriz& L, const Matriz& b);

Matriz SubstRetroativas(const Matriz& U, const Matriz& b);

void DecompPALU(const Matriz& A, Matriz& POut, Matriz& LOut, Matriz& UOut);

Matriz ResSistLinearPALU(const Matriz& A, const Matriz& b);

Matriz CalcInvMatriz(const Matriz& A);

void TrocaLinha(Matriz& m, std::size_t l1, std::size_t l2);

Matriz MatrizI(std::size_t n);
Matriz MatrizZeros(std::size_t n, std::size_t m);

std::size_t AchaIndicePivo(const Matriz& m, std::size_t nColuna, std::size_t nLinInicial);

Matriz CriaMatrizAleatoria(std::size_t numlinhas, std::size_t numColunas)
{
    const auto size = numlinhas * numColunas;
    Matriz m(numlinhas, numColunas);
    for (std::size_t i = 0; i < size; i++)
    {
        m[i] = ((double(rand()) / RAND_MAX) - 0.5);
    }

    return m;
}

Matriz SubstSucessivas(const Matriz& L, const Matriz& b)
{
    const auto size = b.GetNCols() * b.GetNRows();
    Matriz m(b.GetNRows(), b.GetNCols());

    m[0] = b[0] / L[0 + (0 * L.GetNCols())];

    for (std::size_t index = 1; index < size; index++)
    {
        double soma = 0.0;
        for (std::size_t j = 0; j < index; j++)
        {
            soma += L[j + (index * L.GetNCols())] * m[j];
        }
        m[index] = (b[index] - soma) / L[index + (index * L.GetNCols())];
    }

    return m;
}

Matriz SubstRetroativas(const Matriz& U, const Matriz& b)
{
    const auto size_b = b.GetNRows() * b.GetNCols();
    Matriz m(b.GetNRows(), b.GetNCols());

    m[size_b - 1] = b[size_b - 1] / U[(U.GetNCols() - 1) + ((U.GetNRows() - 1) * U.GetNCols())];

    for (std::size_t index = size_b - 2; index > 0; index--)
    {
        double soma = 0.0;
        for (std::size_t j = U.GetNCols() - 1; j > index; j--)
        {
            soma += U[j + (index * U.GetNCols())] * m[j];
        }
        m[index] = (b[index] - soma) / U[index + (index * U.GetNCols())];
    }

    double soma = 0.0;
    for (std::size_t j = U.GetNCols() - 1; j > 0; j--)
    {
        soma += U[j + (0 * U.GetNCols())] * m[j];
    }
    m[0] = (b[0] - soma) / U[0 + (0 * U.GetNCols())];

    return m;
}

void DecompPALU(const Matriz& A, Matriz& POut, Matriz& LOut, Matriz& UOut)
{
    /*
    L = {[1 0 0 .. 0],
         [M 1 0 .. 0],
         [M M 1 .. 0],
         [M M M .. 1]};

    U = {[ Linha Piv� 1],
         [ Linha Piv� 2],
         [ Linha Piv� n],};

    P = {[ 1 na coluna = linha piv� 1],
         [ 1 na coluna = linha piv� 2],
         [ 1 na coluna = linha piv� n]};
    */

    const std::size_t n = A.GetNCols();

    Matriz ML = MatrizZeros(n, n);
    Matriz MP = MatrizI(A.GetNCols());
    Matriz MU = A;

    MatrixD& L = ML;
    MatrixD& U = MU;

    for (std::size_t j = 0; j < n - 1; j++)
    {
        const std::size_t ipiv = AchaIndicePivo(MU, j, j);
        TrocaLinha(MU, j, ipiv);
        TrocaLinha(MP, j, ipiv);
        TrocaLinha(ML, j, ipiv);

        for (std::size_t i = j + 1; i < n; i++)
        {
            L[j + (i * ML.GetNCols())] = U[j + (i * MU.GetNCols())] / U[j + (j * MU.GetNCols())];
            for (std::size_t k = j + 1; k < n; k++)
            {
                U[k + (i * MU.GetNCols())] -= L[j + (i * MU.GetNCols())] * U[k + (j * MU.GetNCols())];
                if (U[k + (i * MU.GetNCols())] == 0.0)
                {
                    int x = 0;
                }
            }
        }
    }

    ML += MatrizI(n);

    POut = std::move(MP);
    LOut = std::move(ML);
    UOut = std::move(MU);
}

void TrocaLinha(Matriz& matriz, std::size_t l1, std::size_t l2)
{
    for (std::size_t j = 0; j < matriz.GetNCols(); j++)
    {
        double tmp = matriz[j + (l2 * matriz.GetNCols())];
        matriz[j + (l2 * matriz.GetNCols())] = matriz[j + (l1 * matriz.GetNCols())];
        matriz[j + (l1 * matriz.GetNCols())] = tmp;
    }
}

Matriz MatrizI(std::size_t n)
{
    return Matriz::identity(n);
}

std::size_t AchaIndicePivo(const Matriz& m, std::size_t nColuna, std::size_t nLinInicial)
{
    std::size_t res = nLinInicial;
    double maior = absVal(m[nColuna + (nLinInicial * m.GetNCols())]);
    for (std::size_t k = nLinInicial + 1; k < m.GetNRows(); ++k)
    {
        const double val = absVal(m[nColuna + (k * m.GetNCols())]);

        if (val > maior)
        {
            res = k;
            maior = val;
        }
    }

    return res;
}

Matriz MatrizZeros(std::size_t n, std::size_t m)
{
    return Matriz::zeros(n, m);
}

Matriz ResSistLinearPALU(const Matriz& A, const Matriz& b)
{
    Matriz P = MatrizZeros(1, 1);
    Matriz U = MatrizZeros(1, 1);
    Matriz L = MatrizZeros(1, 1);


    // DecompPALU(MatrixD(4, 4, {
    //     4, -1, 0, -1,
    //     1, -2, 1, 0,
    //     0, 4, -4, 1,
    //     5, 0, 5, -10 }), P, L, U);

    DecompPALU(A, P, L, U);

    for (std::size_t i = 0; i < U.GetNCols(); i++)
    {
        for (int j = 0; j != i; j++)
        {
            U(i, j) = 0.0;
        }
    }

    // auto AA = L * U;

    // assert(AA == (P * A));

    Matriz Pb = P * b;

    Matriz K = SubstSucessivas(L, Pb);

    // K = UX

    Matriz x = SubstRetroativas(U, K);

    return x;
}

Matriz CalcInvMatriz(const Matriz& A)
{
    // 49 -> frederico
    Matriz P = MatrizZeros(1, 1);
    Matriz L = MatrizZeros(1, 1);
    Matriz U = MatrizZeros(1, 1);

    DecompPALU(A, P, L, U);

    Matriz res(A.GetNRows(), A.GetNCols());

    for (std::size_t j = 0; j < A.GetNCols(); j++)
    {
        Matriz v = MatrizZeros(A.GetNRows(), 1);

        v[j] = 1.0;

        v = P * v;
        Matriz K = SubstSucessivas(L, v);

        // K = UX

        Matriz x = SubstRetroativas(U, K);

        for (std::size_t i = 0; i < A.GetNRows(); i++)
        {
            res[j + (i * A.GetNCols())] = x[i];
        }
    }

    return res;
}