export declare class TreeNode {
    id: string;
    children: TreeNode[];
    parent?: TreeNode;
    name?: string;
    weight?: number;
    deserialize(input: any): TreeNode;
    getParent(): TreeNode;
    getChildren: () => TreeNode[];
    setParent(parent: TreeNode): void;
    addChild(child: TreeNode): void;
    getId(): string;
    setChild(node: TreeNode): boolean;
    addChildToScheme(node: TreeNode, parentId: string): boolean;
}
export declare class Tree {
    private tree_;
    constructor(ok: any, filepath: string);
    getRootNode(): TreeNode;
    countNodes(node: TreeNode): number;
    setTree(tree: TreeNode): void;
}
