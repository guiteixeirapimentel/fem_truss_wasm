#pragma once

#ifdef __cplusplus
extern "C"
{
#endif

    extern const int kBcForce;
    extern const int kBcDisplacement;
    extern const int kInvalidId;

    void UseMatrix();

    int AddNode(double pos_x, double pos_y, int bc_x_type, double bc_x_value, int bc_y_type, double bc_y_value);
    int AddElement(int node_id_i, int node_id_f, double young_mod, double area);

    void Solve();

    double GetNodeDisplacementX(int node_id);
    double GetNodeDisplacementY(int node_id);

    double GetNodeForceX(int node_id);
    double GetNodeForceY(int node_id);

#ifdef __cplusplus
}
#endif
