
import pandas as pd

def auto_binning(df):
    """
    This function performs automated feature type detection and binning.
    - For numerical features, it creates decile bins.
    - For categorical features, it groups rare categories into an 'Other' category.
    """

    # Create a copy of the dataframe to avoid modifying the original
    df_binned = df.copy()

    for col in df_binned.columns:
        # Exclude the timestamp and target columns from binning
        if col in ['timestamp', 'target']:
            continue

        # Check if the column is numerical
        if pd.api.types.is_numeric_dtype(df_binned[col]):
            # Create decile bins for numerical features
            df_binned[col + '_binned'] = pd.qcut(df_binned[col], 10, labels=False, duplicates='drop')

        # Check if the column is categorical
        elif pd.api.types.is_object_dtype(df_binned[col]):
            # Calculate the frequency of each category
            freq = df_binned[col].value_counts(normalize=True)

            # Identify rare categories (less than 1%)
            rare_categories = freq[freq < 0.01].index

            # Group rare categories into 'Other'
            df_binned[col + '_binned'] = df_binned[col].replace(rare_categories, 'Other')

    return df_binned

if __name__ == '__main__':
    # Load the synthetic dataset
    df = pd.read_csv('synthetic_dataset.csv')

    # Perform automated binning
    df_binned = auto_binning(df)

    # Print the first 5 rows of the binned dataframe
    print(df_binned.head())
